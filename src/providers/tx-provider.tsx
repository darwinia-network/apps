import { message } from 'antd';
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { delay, Observer, of } from 'rxjs';
import { TxStatus } from '../components/widget/TxStatus';
import { LONG_DURATION } from '../config';
import { RequiredPartial, Tx, WithOptional } from '../model';
import { combineObserver } from '../utils';

export interface TxCtx {
  setTx: (tx: Tx | null) => void;
  setCanceler: React.Dispatch<React.SetStateAction<(() => void) | null>>;
  tx: Tx | null;
  txProcessObserver: Observer<Tx>;
  createObserver: (...observer: WithOptional<Observer<Tx>, 'complete' | 'error'>[]) => Observer<Tx>;
}

export const afterTxSuccess: (...handlers: ((v: Tx) => void)[]) => (value: Tx) => void =
  (...handlers) =>
  (value) => {
    if (value.status === 'finalized') {
      handlers.forEach((fn) => fn(value));
    }
  };

export const TxContext = createContext<TxCtx | null>(null);

export const TxProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const [tx, setTx] = useState<Tx | null>(null);
  const [canceler, setCanceler] = useState<(() => void) | null>(null);
  const txProcessObserver = useMemo<Observer<Tx>>(() => {
    return {
      next: setTx,
      error: (error: RequiredPartial<Tx, 'error'>) => {
        message.error(error.error?.message || (error as unknown as Record<string, string>).message);
        setTx(null);
      },
      complete: () => {
        console.info('[ tx completed! ]');
      },
    };
  }, []);
  const createObserver = useCallback(
    (...observers: WithOptional<Observer<Tx>, 'complete' | 'error'>[]) => {
      return combineObserver(txProcessObserver, ...observers);
    },
    [txProcessObserver]
  );

  useEffect(() => {
    if (tx?.status === 'finalized' || tx?.status === 'error') {
      of(null).pipe(delay(LONG_DURATION)).subscribe(setTx);
    }
  }, [tx]);

  return (
    <TxContext.Provider value={{ setTx, tx, txProcessObserver, setCanceler, createObserver }}>
      {children}
      <TxStatus
        tx={tx}
        onClose={() => setTx(null)}
        cancel={() => {
          if (canceler) {
            canceler();
            setCanceler(null);
          }

          setTx(null);
        }}
      />
    </TxContext.Provider>
  );
};
