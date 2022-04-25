import { SubmittableResult } from '@polkadot/api';
import { keyring } from '@polkadot/ui-keyring';
import type { QueueTx, QueueTxMessageSetStatus, QueueTxStatus, AddressFlags } from '../../model';

const NOOP = () => undefined;

const NO_FLAGS = {
  accountOffset: 0,
  addressOffset: 0,
  isHardware: false,
  isMultisig: false,
  isProxied: false,
  isQr: false,
  isUnlockable: false,
  threshold: 0,
  who: [],
};

const lockCountdown: Record<string, number> = {};

export function recodeAddress(address: string | Uint8Array): string {
  return keyring.encodeAddress(keyring.decodeAddress(address));
}

// eslint-disable-next-line complexity
export function extractExternal(accountId: string | null): AddressFlags {
  if (!accountId) {
    return NO_FLAGS;
  }

  let publicKey;

  try {
    publicKey = keyring.decodeAddress(accountId);
  } catch (error) {
    console.error(error);

    return NO_FLAGS;
  }

  const pair = keyring.getPair(publicKey);
  const { isExternal, isHardware, isInjected, isMultisig, isProxied } = pair.meta;
  const isUnlockable = !isExternal && !isHardware && !isInjected;

  if (isUnlockable) {
    const entry = lockCountdown[pair.address];

    if (entry && Date.now() > entry && !pair.isLocked) {
      pair.lock();
      lockCountdown[pair.address] = 0;
    }
  }

  return {
    accountOffset: (pair.meta.accountOffset as number) || 0,
    addressOffset: (pair.meta.addressOffset as number) || 0,
    hardwareType: pair.meta.hardwareType as string,
    isHardware: !!isHardware,
    isMultisig: !!isMultisig,
    isProxied: !!isProxied,
    isQr: !!isExternal && !isMultisig && !isProxied && !isHardware && !isInjected,
    isUnlockable: isUnlockable && pair.isLocked,
    threshold: (pair.meta.threshold as number) || 0,
    who: ((pair.meta.who as string[]) || []).map(recodeAddress),
  };
}

export function handleTxResults(
  handler: 'send' | 'signAndSend',
  queueSetTxStatus: QueueTxMessageSetStatus,
  { id, txFailedCb = NOOP, txSuccessCb = NOOP, txUpdateCb = NOOP }: QueueTx,
  unsubscribe: () => void
): (result: SubmittableResult) => void {
  // eslint-disable-next-line complexity
  return (result: SubmittableResult): void => {
    if (!result || !result.status) {
      return;
    }

    const status = result.status.type.toLowerCase() as QueueTxStatus;

    console.log(`${handler}: status :: ${JSON.stringify(result)}`);

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

    if (result.isCompleted) {
      unsubscribe();
    }
  };
}
