import { AccountData } from '@darwinia/types';
import { ApiPromise } from '@polkadot/api';
import { PalletBalancesBalanceLock } from '@polkadot/types/lookup';
import { BN_ZERO, bnMax, BN } from '@polkadot/util';
import { waitUntilConnected } from '../network';
import { entrance } from '../network';
import { abi } from '../../config/abi';

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

    const ring = free.sub(maxLock);
    const kton = freeKton.sub(maxKtonLock);

    return [ring.isNeg() ? BN_ZERO.toString() : ring.toString(), kton.isNeg() ? BN_ZERO.toString() : kton.toString()];
  } catch (err) {
    console.error(err);
    return ['0', '0'];
  }
}

export async function getDvmBalance(ktonTokenAddress: string, account: string): Promise<[string, string]> {
  let ring = '0';
  let kton = '0';

  if (account) {
    const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);

    try {
      ring = await web3.eth.getBalance(account);
    } catch (err) {
      console.error(err);
    }

    try {
      const contract = new web3.eth.Contract(abi.ktonABI, ktonTokenAddress);
      kton = await contract.methods.balanceOf(account).call();
    } catch (err) {
      console.error(err);
    }
  }

  return [ring, kton];
}
