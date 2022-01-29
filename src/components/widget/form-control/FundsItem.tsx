import FormItem from 'antd/lib/form/FormItem';
import { isString, omit } from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from '../../../hooks';
import { Asset, CustomFormItemProps } from '../../../model';
import { insufficientBalanceRule, isRing } from '../../../utils';
import { Fund, FundControl } from './FundsControl';

export function FundItem({ label, name, onChange }: CustomFormItemProps<Fund>) {
  const { t } = useTranslation();
  const { assets } = useAccount();
  const [asset, setAsset] = useState<Asset | null>(null);

  return (
    <FormItem
      name={name}
      label={isString(label) ? t(label) : label}
      rules={[
        {
          validator: (_, val) => {
            const { amount } = val ?? {};

            return amount && Number(amount) > 0 ? Promise.resolve() : Promise.reject();
          },
          message: t(`${name} is required`, { name }),
        },
        asset
          ? insufficientBalanceRule({
              t,
              compared: asset.max,
              token: asset.token,
            })
          : {},
      ]}
      extra={
        <span className="text-xs">
          {t('Please keep a little {{token}} as fee', {
            token: assets.find((item) => isRing(item.asset))?.token?.symbol ?? 'RING',
          })}
        </span>
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
      />
    </FormItem>
  );
}
