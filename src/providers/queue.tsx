import React, { useState, useCallback, createContext, useRef } from 'react';
import { SubmittableResult } from '@polkadot/api';
import { notification } from 'antd';
import type { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import type { Registry, SignerPayloadJSON } from '@polkadot/types/types';
import jsonrpc from '@polkadot/types/interfaces/jsonrpc';
import {
  QueueTx,
  QueueTxStatus,
  QueueTxPayloadAdd,
  QueueTxExtrinsicAdd,
  QueueTxRpcAdd,
  QueueTxMessageSetStatus,
  QueueTxExtrinsic,
  QueueTxRpc,
  PartialQueueTxRpc,
  SignerCallback,
  PartialQueueTxExtrinsic,
} from '../model';

let nextId = 0;
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

export interface QueueCtx {
  txqueue: QueueTx[];
  queueExtrinsic: QueueTxExtrinsicAdd;
  queuePayload: QueueTxPayloadAdd;
  queueRpc: QueueTxRpcAdd;
  queueSetTxStatus: QueueTxMessageSetStatus;
}

const defaultState: Partial<QueueCtx> = {
  txqueue: [] as QueueTx[],
};

export const QueueContext = createContext<QueueCtx>(defaultState as QueueCtx);

export const QueueProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const [txqueue, _setTxQueue] = useState<QueueTx[]>([]);
  const txRef = useRef(txqueue);

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
      notification.close(id.toString());

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

      if (STATUS_COMPLETE.includes(status)) {
        setTimeout((): void => {
          const item = txRef.current.find((value) => value.id === id);
          if (item) {
            item.removeItem();
            notification.close(id.toString());
          }
        }, REMOVE_TIMEOUT);
      }
    },
    [setTxQueue]
  );

  return (
    <QueueContext.Provider
      value={{
        queueExtrinsic,
        queuePayload,
        queueRpc,
        queueSetTxStatus,
        txqueue,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};
