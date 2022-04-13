import BigNumber from 'bignumber.js';
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

export function ringToKton(value: string | number, month: number): string {
  return (
    new BigNumber(value)
      // eslint-disable-next-line no-magic-numbers
      .times(new BigNumber(67 / 66).pow(month).minus(1))
      // eslint-disable-next-line no-magic-numbers
      .div(new BigNumber(1970))
      .integerValue()
      .toString()
  );
}

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
      unbonding: unlockingTotalValue,
    };
  }

  return {
    bonded: stakingLedger.activeKton?.toBn(),
    locked: null,
    unbonding: unlockingKtonTotalValue,
  };
}
