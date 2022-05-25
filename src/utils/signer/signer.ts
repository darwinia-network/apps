import { web3FromAddress } from '@polkadot/extension-dapp';
import { Observable, Subscriber, from, tap, switchMap } from 'rxjs';
import { ApiPromise, SubmittableResult } from '@polkadot/api';
import { assert, isFunction, loggerFormat } from '@polkadot/util';
import { QueueTx, QueueTxMessageSetStatus, QueueTxStatus } from '../../model';

const NOOP = () => undefined;

const AVAIL_STATUS = ['queued', 'qr', 'signing'];

type ItemState = {
  count: number;
  currentItem: QueueTx | null;
  isRpc: boolean;
  isExtrinsic: boolean;
};

export function extractCurrent(txqueue: QueueTx[]): ItemState {
  const available = txqueue.filter(({ status }) => AVAIL_STATUS.includes(status));
  const currentItem = available[0] || null;
  let isRpc = false;
  let isExtrinsic = false;

  if (currentItem?.status === 'queued' && !currentItem.extrinsic) {
    isRpc = true;
  } else if (currentItem?.status !== 'signing') {
    isExtrinsic = true;
  }

  return {
    count: available.length,
    currentItem,
    isRpc,
    isExtrinsic,
  };
}

export const signAndSendTx = (currentItem: QueueTx, queueSetTxStatus: QueueTxMessageSetStatus) => {
  const {
    id,
    extrinsic,
    signAddress,
    txStartCb = NOOP,
    txUpdateCb = NOOP,
    txSuccessCb = NOOP,
    txFailedCb = NOOP,
  } = currentItem;

  if (extrinsic) {
    from(web3FromAddress(signAddress))
      .pipe(
        tap((injected) => assert(injected, `Unable to find a signer for ${signAddress}`)),
        tap(() => {
          queueSetTxStatus(id, 'signing');
          txStartCb();
        }),
        switchMap((injected) => extrinsic.signAsync(signAddress, { signer: injected.signer })),
        tap(() => queueSetTxStatus(id, 'sending')),
        switchMap(
          () =>
            new Observable((subscriber: Subscriber<SubmittableResult>) => {
              (async () => {
                try {
                  const unsub = await extrinsic.send((result) => {
                    subscriber.next(result);
                    if (result.isCompleted) {
                      unsub();
                      subscriber.complete();
                    }
                  });
                } catch (err) {
                  subscriber.error(err);
                }
              })();
            })
        )
      )
      .subscribe({
        next: (result) => {
          const status = result.status.type.toLowerCase() as QueueTxStatus;

          console.log(`[tx result]: status :: ${JSON.stringify(result)}`);

          queueSetTxStatus(id, status, result);
          txUpdateCb(result);

          if (result.status.isFinalized || result.status.isInBlock) {
            result.events
              .filter(({ event: { section } }) => section === 'system')
              .forEach(({ event: { method } }): void => {
                if (method === 'ExtrinsicFailed') {
                  txFailedCb(result);
                } else if (method === 'ExtrinsicSuccess') {
                  txSuccessCb(result);
                }
              });
          } else if (result.isError) {
            txFailedCb(result);
          }
        },
        error: (error) => {
          txFailedCb(error);
          queueSetTxStatus(id, 'error', undefined, error);
        },
      });
  }
};

export const sendRpc = (api: ApiPromise, currentItem: QueueTx, queueSetTxStatus: QueueTxMessageSetStatus) => {
  const { id, rpc, values = [] } = currentItem;

  if (rpc) {
    from([currentItem])
      .pipe(
        tap(() => queueSetTxStatus(id, 'sending')),
        switchMap(({ rpc: { section, method } }) => {
          const apiRpc = api.rpc as Record<string, Record<string, (...params: unknown[]) => Promise<unknown>>>;

          assert(isFunction(apiRpc[section] && apiRpc[section][method]), `api.rpc.${section}.${method} does not exist`);

          return apiRpc[section][method](...values);
        }),
        tap((result) => console.log('sendRpc: result ::', loggerFormat(result)))
      )
      .subscribe({
        next: (result) => queueSetTxStatus(id, 'sent', result as SubmittableResult),
        error: (error) => queueSetTxStatus(id, 'error', undefined, error),
      });
  }
};
