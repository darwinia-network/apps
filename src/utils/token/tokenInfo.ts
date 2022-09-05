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
 * @return [RING_BALANCE, KTON_BALANCE, RING_FREE, KTON_FREE]
 */
// eslint-disable-next-line complexity
export async function getDarwiniaBalances(api: ApiPromise, account = ''): Promise<[BN, BN, BN, BN]> {
  if (account) {
    try {
      await waitUntilConnected(api);

      const {
        data: { free: freeRing, freeKton },
      }: { data: AccountData } = await api.query.system.account(account);

      const ringLocks: PalletBalancesBalanceLock[] = (await api.query.balances.locks(account)) || [];
      const ktonLocks: PalletBalancesBalanceLock[] = (await api.query.kton?.locks(account)) || [];

      let maxRingLock = BN_ZERO;
      let maxKtonLock = BN_ZERO;

      ringLocks.forEach((item) => {
        maxRingLock = calcMax(item, maxRingLock);
      });

      ktonLocks.forEach((item) => {
        maxKtonLock = calcMax(item, maxKtonLock);
      });

      const ring = freeRing.sub(maxRingLock);
      const kton = freeKton?.sub(maxKtonLock) ?? BN_ZERO;

      return [ring.isNeg() ? BN_ZERO : ring, kton.isNeg() ? BN_ZERO : kton, freeRing, freeKton];
    } catch (error) {
      console.error('Get Darwinia balance:', error);
    }
  }

  return [BN_ZERO, BN_ZERO, BN_ZERO, BN_ZERO];
}

export async function getDvmBalances(ktonTokenAddress: string, account: string): Promise<[string, string]> {
  let ring = '0';
  let kton = '0';

  if (account) {
    const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);

    try {
      ring = await web3.eth.getBalance(account);
    } catch (err) {
      console.error(err);
    }

    if (ktonTokenAddress) {
      try {
        const contract = new web3.eth.Contract(abi.ktonABI, ktonTokenAddress);
        kton = await contract.methods.balanceOf(account).call();
      } catch (err) {
        console.error(err);
      }
    }
  }

  return [ring, kton];
}
