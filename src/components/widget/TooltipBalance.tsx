import { Tooltip } from 'antd';
import type { BN } from '@polkadot/util';
import type { Balance } from '@polkadot/types/interfaces';

import { useApi } from '../../hooks';
import { fromWei, getUnit, prettyNumber } from '../../utils';

interface Props {
  value: Balance | BN | string | number | null | undefined;
  precision?: number;
  className?: string;
  integerClassName?: string;
  decimalClassName?: string;
}

export const TooltipBalance = ({ value, precision, className, integerClassName, decimalClassName }: Props) => {
  const { network } = useApi();

  const balance = fromWei({ value, unit: getUnit(precision || Number(network.tokens.ring.decimal)) });
  const [integer, decimal] = prettyNumber(balance).split('.');

  return (
    <Tooltip title={balance}>
      <span className={`inline-flex flex-nowrap ${className}`}>
        <span className={`font-bold ${integerClassName}`}>{decimal ? `${integer}.` : integer}</span>
        {decimal && <span className={`font-normal opacity-60 ${decimalClassName}`}>{decimal}</span>}
      </span>
    </Tooltip>
  );
};
