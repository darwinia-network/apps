import { Fund } from '../../components/widget/form-control/FundsControl';
import { getUnit, toWei } from '../helper';

export function fundParam(data: Fund) {
  const { asset, amount, token } = data;

  return {
    [`${asset}balance`]: toWei({ value: amount, unit: getUnit(+token.decimal) }),
  };
}
