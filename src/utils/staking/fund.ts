import BigNumber from 'bignumber.js';
import { Fund } from '../../model';
import { getUnit, toWei } from '../helper';

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
