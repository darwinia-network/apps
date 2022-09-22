import { BN, BN_ZERO, bnToBn } from '@polkadot/util';
import type { Balance } from '@polkadot/types/interfaces';
import type { DeriveStakingAccount } from '@darwinia/api-derive/types';
import { Fund } from '../../model';
import { getUnit, toWei } from '../helper';
import { isRing } from '../helper';

export function fundParam(data: Fund): { RingBalance: string } | { KtonBalance: string } {
  const { amount, token } = data;

  const value = toWei({
    value: amount,
    unit: getUnit(+token.decimal),
  });

  return isRing(token.symbol) ? { RingBalance: value } : { KtonBalance: value };
}

// https://github.com/darwinia-network/darwinia-common/blob/main/frame/staking/src/inflation.rs#L129
/* eslint-disable no-magic-numbers */
export const computeKtonReward = (amount: Balance | BN | string | number, months: number): BN => {
  const value = bnToBn(amount);
  const n = bnToBn(67).pow(bnToBn(months));
  const d = bnToBn(66).pow(bnToBn(months));
  const quot = n.div(d);
  const rem = n.mod(d);
  const precision = bnToBn(1000);

  return precision.mul(quot.subn(1)).add(precision.mul(rem).div(d)).mul(value).div(bnToBn(1970000));
};
/* eslint-enable no-magic-numbers */

// eslint-disable-next-line complexity
export function getLedger(symbol: string, empty: boolean, derive: DeriveStakingAccount | null) {
  if (empty || !derive) {
    return { bonded: null, unbonding: null, locked: null };
  }

  const { stakingLedger, unlockingTotalValue, unlockingKtonTotalValue } = derive;

  if (isRing(symbol)) {
    const locked = stakingLedger.activeDepositRing.toBn();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const bonded = (stakingLedger.active || stakingLedger.activeRing).toBn().sub(locked);

    return {
      bonded,
      locked,
      unbonded: derive.redeemable?.length ? derive.redeemable[0] : BN_ZERO,
      unbonding: unlockingTotalValue,
    };
  }

  return {
    bonded: stakingLedger.activeKton?.toBn(),
    locked: null,
    unbonded: derive.redeemable?.length ? derive.redeemable[1] : BN_ZERO,
    unbonding: unlockingKtonTotalValue,
  };
}
