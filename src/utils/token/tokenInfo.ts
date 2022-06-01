import { AccountData } from '@darwinia/types';
import { ApiPromise } from '@polkadot/api';
import { PalletBalancesBalanceLock } from '@polkadot/types/lookup';
import { BN_ZERO, bnMax } from '@polkadot/util';
import { waitUntilConnected } from '../network';

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

    let maxRingLock = BN_ZERO;
    let maxKtonLock = BN_ZERO;

    locks.forEach((item) => {
      if (!item.reasons.isFee) {
        maxRingLock = bnMax(item.amount, maxRingLock);
      }
    });

    ktonLocks.forEach((item) => {
      if (!item.reasons.isFee) {
        maxKtonLock = bnMax(item.amount, maxKtonLock);
      }
    });

    return [free.sub(maxRingLock).toString(), freeKton.sub(maxKtonLock).toString()];
  } catch (err) {
    console.error(err);
    return ['0', '0'];
  }
}
