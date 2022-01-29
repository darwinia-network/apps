import FormItem from 'antd/lib/form/FormItem';
import { isString, isUndefined, omit } from 'lodash';
import { useMemo } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from '../../../hooks';
import { Asset, CustomFormItemProps, DarwiniaAsset, Fund } from '../../../model';
import { fromWei, insufficientBalanceRule, isRing } from '../../../utils';
import { FundControl, FundControlProps } from './FundControl';

interface FundItemProps extends CustomFormItemProps<Fund>, Pick<FundControlProps, 'hiddenAssets'> {
  max?: { [key in DarwiniaAsset]?: string };
}

// eslint-disable-next-line complexity
export function FundItem({ label, name, extra, max, hiddenAssets, onChange }: FundItemProps) {
  const { t } = useTranslation();
  const { assets } = useAccount();
  const [asset, setAsset] = useState<Asset | null>(null);
  const maxValue = useMemo(() => (max && asset ? max[asset.asset as DarwiniaAsset] : undefined), [asset, max]);

  return (
    <FormItem
      name={name}
      label={isString(label) ? t(label) : label}
      rules={[
        {
          validator: (_, val) => {
            const { amount } = val;

            // As untouched
            if (amount === '-0') {
              return Promise.resolve();
            }

            return amount && Number(amount) > 0 ? Promise.resolve() : Promise.reject();
          },
          message: t(`${name} is required`, { name }),
        },
        asset
          ? insufficientBalanceRule({
              t,
              compared: maxValue ?? asset.max,
              token: asset.token,
            })
          : {},
      ]}
      extra={
        isUndefined(extra) ? (
          <span className="text-xs">
            {t('Please keep a little {{token}} as fee', {
              token: assets.find((item) => isRing(item.asset))?.token?.symbol ?? 'RING',
            })}
          </span>
        ) : (
          extra
        )
      }
    >
      <FundControl
        onChange={(value) => {
          if (onChange) {
            onChange(value);
          }

          const data = omit(value, 'amount');

          setAsset(data);
        }}
        max={maxValue && fromWei({ value: maxValue })}
        hiddenAssets={hiddenAssets}
      />
    </FormItem>
  );
}
