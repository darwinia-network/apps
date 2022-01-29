import { Select } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useAccount } from '../../../hooks';
import { Asset, CustomFormControlProps } from '../../../model';
import { BalanceControl } from './BalanceControl';

export interface Fund extends Asset {
  amount: string;
}

export function FundControl({ onChange }: CustomFormControlProps<Fund>) {
  const { assets } = useAccount();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [amount, setAmount] = useState<string>('');
  const triggerChange = useCallback(
    (val: Fund) => {
      if (onChange) {
        onChange(val);
      }
    },
    [onChange]
  );

  useEffect(() => {
    if (selectedAsset === null && assets.length) {
      setSelectedAsset(assets[0]);
      triggerChange({ amount: amount || '0', ...assets[0] });
    }
  }, [assets, selectedAsset, amount, triggerChange]);

  return (
    <BalanceControl
      compact
      onChange={(value) => {
        setAmount(value);

        if (selectedAsset) {
          triggerChange({ amount: value, ...selectedAsset });
        }
      }}
      size="large"
      className="flex-1"
    >
      <Select<string>
        onChange={(unit) => {
          const cur = assets.find((item) => item.token?.symbol === unit);

          if (cur) {
            setSelectedAsset(cur);
            triggerChange({ ...cur, amount });
          }
        }}
        value={selectedAsset?.token?.symbol}
        size="large"
        style={{ border: 'none' }}
      >
        {assets.map((item) => {
          const { token } = item;

          return (
            <Select.Option value={token.symbol} key={token.symbol}>
              <span className="uppercase">{token.symbol}</span>
            </Select.Option>
          );
        })}
      </Select>
    </BalanceControl>
  );
}
