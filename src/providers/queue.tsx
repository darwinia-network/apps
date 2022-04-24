import React, { useState, useCallback, createContext, useRef } from 'react';
import { SubmittableResult, ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import type { DispatchError } from '@polkadot/types/interfaces';
import type { ITuple, Registry, SignerPayloadJSON } from '@polkadot/types/types';
import jsonrpc from '@polkadot/types/interfaces/jsonrpc';
import type { Bytes } from '@polkadot/types';
import { getDispatchError, getIncompleteMessage, getContractAbi } from '../utils';
import { useApi } from '../hooks';
import {
  QueueStatus,
  QueueTx,
  QueueTxStatus,
  QueueAction$Add,
  QueueTxPayloadAdd,
  QueueTxExtrinsicAdd,
  QueueTxRpcAdd,
  QueueTxMessageSetStatus,
  QueueTxExtrinsic,
  QueueTxRpc,
  ActionStatusPartial,
  ActionStatus,
  PartialQueueTxRpc,
  SignerCallback,
  PartialQueueTxExtrinsic,
} from '../model';

interface StatusCount {
  count: number;
  status: ActionStatusPartial;
}

let nextId = 0;

const EVENT_MESSAGE = 'extrinsic event';
const REMOVE_TIMEOUT = 7500;
const SUBMIT_RPC = jsonrpc.author.submitAndWatchExtrinsic;

export const STATUS_COMPLETE: QueueTxStatus[] = [
  // status from subscription
  'finalitytimeout',
  'finalized',
  'inblock',
  'usurped',
  'dropped',
  'invalid',
  // normal completion
  'cancelled',
  'error',
  'sent',
];

const mergeStatus = (status: ActionStatusPartial[]): ActionStatus[] => {
  let others: ActionStatus | null = null;

  const initial = status
    .reduce((acc: StatusCount[], cur): StatusCount[] => {
      const previous = acc.find(({ status: prev }) => prev.action === cur.action && prev.status === cur.status);

      if (previous) {
        previous.count++;
      } else {
        acc.push({ count: 1, status: cur });
      }

      return acc;
    }, [])
    .map(
      (item): ActionStatusPartial =>
        item.count === 1 ? item.status : { ...item.status, action: `${item.status.action} (x${item.count})` }
    )
    .filter((item): boolean => {
      if (item.message !== EVENT_MESSAGE) {
        return true;
      }

      if (others) {
        if (item.action.startsWith('system.ExtrinsicSuccess')) {
          (others.action as string[]).unshift(item.action);
        } else {
          (others.action as string[]).push(item.action);
        }
      } else {
        others = {
          ...item,
          action: [item.action],
        };
      }

      return false;
    });

  return others ? initial.concat(others) : initial;
};

const extractEvents = (api: ApiPromise, result?: SubmittableResult): ActionStatus[] => {
  return mergeStatus(
    ((result && result.events) || [])
      // filter events handled globally, or those we are not interested in, these are
      // handled by the global overview, so don't add them here
      .filter((record) => !!record.event && record.event.section !== 'democracy')
      // eslint-disable-next-line complexity
      .map((record): ActionStatusPartial => {
        const {
          event: { data, method, section },
        } = record;

        if (section === 'system' && method === 'ExtrinsicFailed') {
          const [dispatchError] = data as unknown as ITuple<[DispatchError]>;

          return {
            action: `${section}.${method}`,
            message: getDispatchError(dispatchError),
            status: 'error',
          };
        }

        const incomplete = getIncompleteMessage(record);

        if (incomplete) {
          return {
            action: `${section}.${method}`,
            message: incomplete,
            status: 'eventWarn',
          };
        } else if (section === 'contracts') {
          // eslint-disable-next-line no-magic-numbers
          if (method === 'ContractExecution' && data.length === 2) {
            // see if we have info for this contract
            const [accountId, encoded] = data;

            try {
              const abi = getContractAbi(api, accountId.toString());

              if (abi) {
                const decoded = abi.decodeEvent(encoded as Bytes);

                return {
                  action: decoded.event.identifier,
                  message: 'contract event',
                  status: 'event',
                };
              }
            } catch (error) {
              // ABI mismatch?
              console.error(error);
            }
          } else if (method === 'Evicted') {
            return {
              action: `${section}.${method}`,
              message: 'contract evicted',
              status: 'error',
            };
          }
        }

        return {
          action: `${section}.${method}`,
          message: EVENT_MESSAGE,
          status: 'event',
        };
      })
  );
};

export interface QueueCtx {
  stqueue: QueueStatus[];
  txqueue: QueueTx[];
  queueAction: QueueAction$Add;
  queueExtrinsic: QueueTxExtrinsicAdd;
  queuePayload: QueueTxPayloadAdd;
  queueRpc: QueueTxRpcAdd;
  queueSetTxStatus: QueueTxMessageSetStatus;
}

const defaultState: Partial<QueueCtx> = {
  stqueue: [] as QueueStatus[],
  txqueue: [] as QueueTx[],
};

export const QueueContext = createContext<QueueCtx>(defaultState as QueueCtx);

export const QueueProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const { api } = useApi();
  const [stqueue, _setStQueue] = useState<QueueStatus[]>([]);
  const [txqueue, _setTxQueue] = useState<QueueTx[]>([]);
  const stRef = useRef(stqueue);
  const txRef = useRef(txqueue);

  const setStQueue = useCallback((st: QueueStatus[]): void => {
    stRef.current = st;
    _setStQueue(st);
  }, []);

  const setTxQueue = useCallback((tx: QueueTx[]): void => {
    txRef.current = tx;
    _setTxQueue(tx);
  }, []);

  const addToTxQueue = useCallback(
    (value: QueueTxExtrinsic | QueueTxRpc | QueueTx): void => {
      const id = ++nextId;
      const removeItem = () =>
        setTxQueue([
          ...txRef.current.map((item): QueueTx => (item.id === id ? { ...item, status: 'completed' } : item)),
        ]);

      setTxQueue([
        ...txRef.current,
        {
          ...value,
          id,
          removeItem,
          rpc: (value as QueueTxRpc).rpc || SUBMIT_RPC,
          status: 'queued',
        },
      ]);
    },
    [setTxQueue]
  );

  const queueAction = useCallback(
    (_status: ActionStatus | ActionStatus[]): void => {
      const status = Array.isArray(_status) ? _status : [_status];

      if (status.length) {
        setStQueue([
          ...stRef.current,
          ...status.map((item): QueueStatus => {
            const id = ++nextId;
            const removeItem = (): void => setStQueue([...stRef.current.filter((value) => value.id !== id)]);

            setTimeout(removeItem, REMOVE_TIMEOUT);

            return {
              ...item,
              id,
              isCompleted: false,
              removeItem,
            };
          }),
        ]);
      }
    },
    [setStQueue]
  );

  const queueExtrinsic = useCallback((value: PartialQueueTxExtrinsic) => addToTxQueue({ ...value }), [addToTxQueue]);

  const queuePayload = useCallback(
    (registry: Registry, payload: SignerPayloadJSON, signerCb: SignerCallback): void => {
      addToTxQueue({
        accountId: payload.address,
        // this is not great, but the Extrinsic doesn't need a submittable
        extrinsic: registry.createType(
          'Extrinsic',
          { method: registry.createType('Call', payload.method) },
          { version: payload.version }
        ) as unknown as SubmittableExtrinsic,
        payload,
        signerCb,
      });
    },
    [addToTxQueue]
  );

  const queueRpc = useCallback((value: PartialQueueTxRpc) => addToTxQueue({ ...value }), [addToTxQueue]);

  const queueSetTxStatus = useCallback(
    (id: number, status: QueueTxStatus, result?: SubmittableResult, error?: Error): void => {
      setTxQueue([
        ...txRef.current.map(
          (item): QueueTx =>
            item.id === id
              ? {
                  ...item,
                  error: error === undefined ? item.error : error,
                  result: result === undefined ? (item.result as SubmittableResult) : result,
                  status: item.status === 'completed' ? item.status : status,
                }
              : item
        ),
      ]);

      queueAction(extractEvents(api, result));

      if (STATUS_COMPLETE.includes(status)) {
        setTimeout((): void => {
          const item = txRef.current.find((value) => value.id === id);
          if (item) {
            item.removeItem();
          }
        }, REMOVE_TIMEOUT);
      }
    },
    [queueAction, setTxQueue, api]
  );

  return (
    <QueueContext.Provider
      value={{
        queueAction,
        queueExtrinsic,
        queuePayload,
        queueRpc,
        queueSetTxStatus,
        stqueue,
        txqueue,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};
