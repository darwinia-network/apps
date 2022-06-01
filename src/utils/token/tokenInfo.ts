import { AccountData } from '@darwinia/types';
import { ApiPromise } from '@polkadot/api';
import { PalletBalancesBalanceLock } from '@polkadot/types/lookup';
import { BN_ZERO, bnMax, BN } from '@polkadot/util';
import { waitUntilConnected } from '../network';

// eslint-disable-next-line
const calcMax = (lockItem: any, current: BN) => {
  let max = current;

  if (lockItem.reasons && !lockItem.reasons.isFee) {
    max = bnMax(lockItem.amount, max);
  } else if (lockItem.lockReasons && !lockItem.lockReasons.isFee) {
    if (lockItem.lockFor.isCommon) {
      max = bnMax(lockItem.lockFor.asCommon.amount, max);
    } else if (lockItem.lockFor.isStaking) {
      max = bnMax(lockItem.lockFor.asStaking.stakingAmount, max);
    }
  }

  return max;
};

/**
 * @description other api can get balances:  api.derive.balances.all, api.query.system.account;
 * @see https://github.com/darwinia-network/wormhole-ui/issues/142
 */
export async function getDarwiniaBalances(api: ApiPromise, account = ''): Promise<[string, string]> {
  // FIXME: (api.rpc as any).balances.usableBalance(0, '') result is not 0, manual reset
  if (!account) {
    return ['0', '0'];
  }

  await waitUntilConnected(api);

  try {
    const {
      data: { free, freeKton },
    }: { data: AccountData } = await api.query.system.account(account);
    const locks: PalletBalancesBalanceLock[] = await api.query.balances.locks(account);
    const ktonLocks: PalletBalancesBalanceLock[] = await api.query.kton.locks(account);

    let maxLock = BN_ZERO;
    let maxKtonLock = BN_ZERO;

    locks.forEach((item) => {
      maxLock = calcMax(item, maxLock);
    });

    ktonLocks.forEach((item) => {
      maxKtonLock = calcMax(item, maxKtonLock);
    });

    return [free.sub(maxLock).toString(), freeKton.sub(maxKtonLock).toString()];
  } catch (err) {
    console.error(err);
    return ['0', '0'];
  }
}
