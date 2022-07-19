import { BN, bnToBn } from '@polkadot/util';
import type { Balance } from '@polkadot/types/interfaces';
import { Fund } from '../../model';
import { getUnit, toWei } from '../helper';
import { DeriveStakingAccount } from '../../api-derive/types';
import { isRing } from '../helper';

export function fundParam(data: Fund) {
  const { asset, amount, token } = data;

  return {
    [`${asset}balance`]: toWei({ value: amount, unit: getUnit(+token.decimal) }),
  };
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
      unbonded: derive.redeemableRing,
      unbonding: unlockingTotalValue,
    };
  }

  return {
    bonded: stakingLedger.activeKton?.toBn(),
    locked: null,
    unbonded: derive.redeemableKton,
    unbonding: unlockingKtonTotalValue,
  };
}
