import React, { useState, useCallback, createContext, useRef } from 'react';
import { SubmittableResult } from '@polkadot/api';
import { notification } from 'antd';
import jsonrpc from '@polkadot/types/interfaces/jsonrpc';
import { timer } from 'rxjs';
import {
  QueueTx,
  QueueTxStatus,
  QueueTxExtrinsicAdd,
  QueueTxRpcAdd,
  QueueTxMessageSetStatus,
  QueueTxExtrinsic,
  QueueTxRpc,
} from '../model';
import { MIDDLE_DURATION } from '../config';

let nextId = 0;
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

  const queueExtrinsic = useCallback((value: QueueTxExtrinsic) => addToTxQueue({ ...value }), [addToTxQueue]);

  const queueRpc = useCallback((value: QueueTxRpc) => addToTxQueue({ ...value }), [addToTxQueue]);

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
        timer(MIDDLE_DURATION).subscribe(() => {
          const item = txRef.current.find((value) => value.id === id);
          if (item) {
            item.removeItem();
            notification.close(id.toString());
          }
        });
      }
    },
    [setTxQueue]
  );

  return (
    <QueueContext.Provider
      value={{
        queueExtrinsic,
        queueRpc,
        queueSetTxStatus,
        txqueue,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};
