import { ApiPromise, SubmittableResult } from '@polkadot/api';
import { TransactionConfig } from 'web3-eth/types';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { web3FromAddress } from '@polkadot/extension-dapp';
import { from, Observable, Observer, switchMapTo, tap } from 'rxjs';
import { PromiEvent, TransactionReceipt } from 'web3-core';
import { notification } from 'antd';
import { Tx } from '../../model';
import { entrance, waitUntilConnected } from '../network';

export function extrinsicSpy(observer: Observer<Tx>) {
  observer.next({ status: 'signing' });

  // eslint-disable-next-line complexity
  return async (result: SubmittableResult) => {
    if (!result || !result.status) {
      return;
    }

    console.info('%c [ extrinsic status ]-22', 'font-size:13px; background:pink; color:blue;', result.status.toJSON());

    const { error, inBlock, finalized } = result.status.toJSON() as Record<string, string>;

    if (result.status.isBroadcast) {
      observer.next({ status: 'broadcast' });
    }

    if (result.status.isReady) {
      observer.next({ status: 'queued' });
    }

    if (result.status.isInBlock) {
      observer.next({ status: 'inblock', hash: inBlock });
    }

    if (result.status.isFinalized) {
      observer.next({ status: 'finalized', hash: finalized });
      observer.complete();
    }

    if (result.isError) {
      observer.error({ status: 'error', error });
    }
  };
}

export function signAndSendExtrinsic(
  api: ApiPromise,
  sender: string,
  extrinsic: SubmittableExtrinsic<'promise', SubmittableResult>
) {
  const obs = new Observable((spy: Observer<Tx>) => {
    waitUntilConnected(api!)
      .then(() => extrinsic.signAndSend(sender, extrinsicSpy(spy)))
      .catch((error) => {
        spy.error({ status: 'error', error });
      });
  });

  return from(web3FromAddress(sender)).pipe(
    tap((injector) => api.setSigner(injector.signer)),
    switchMapTo(obs)
  );
}

export function getSendTransactionObs(params: TransactionConfig): Observable<Tx> {
  return new Observable((observer) => {
    try {
      const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);

      observer.next({ status: 'signing' });
      web3.eth
        .sendTransaction(params)
        .on('transactionHash', (hash: string) => {
          observer.next({ status: 'queued', hash });
        })
        .on('receipt', ({ transactionHash }) => {
          observer.next({ status: 'finalized', hash: transactionHash });
          observer.complete();
        })
        .catch((error: { code: number; message: string }) => {
          observer.error({ status: 'error', error: error.message });
        });
    } catch (error) {
      console.warn('%c contract tx observable error', 'font-size:13px; background:pink; color:#bf2c9f;', error);
      observer.error({ status: 'error', error: 'Contract construction/call failed!' });
    }
  });
}

export const handleEthTxResult = (
  tx: PromiEvent<TransactionReceipt>,
  { txSuccessCb = () => undefined, txFailedCb = () => undefined }: { txSuccessCb?: () => void; txFailedCb?: () => void }
) => {
  tx.on('transactionHash', (hash: string) => {
    void hash;
  })
    .on('receipt', ({ transactionHash }) => {
      txSuccessCb();
      notification.success({
        message: 'Transaction success',
        description: `Transaction hash: ${transactionHash}`,
      });
    })
    .catch((error: { code: number; message: string }) => {
      txFailedCb();
      console.error(error);
      notification.error({
        message: 'Transaction failed',
        description: error.message,
      });
    });
};
