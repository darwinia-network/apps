import { Select, Checkbox } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import { isString } from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from '../../../hooks';
import { Asset, CustomFormItemProps } from '../../../model';
import { isRing, isKton } from '../../../utils';

const MAX_PERIOD = 36;
const LOCK_PERIOD = [0, ...new Array(MAX_PERIOD).fill(0).map((_, index) => index + 1)];

interface PromiseMonthItemProps extends CustomFormItemProps {
  selectedAsset: Asset | null;
}

// eslint-disable-next-line complexity
export function PromiseMonthItem({ selectedAsset, label, name, onChange }: PromiseMonthItemProps) {
  const { t } = useTranslation();
  const [duration, setDuration] = useState(0);
  const { assets } = useAccount();

  return selectedAsset ? (
    <>
      {isRing(selectedAsset?.asset) && (
        <FormItem name={name} label={isString(label) ? t(label) : label} rules={[{ required: true }]}>
          <Select
            size="large"
            onChange={(value: string) => {
              setDuration(Number(value));

              if (onChange) {
                onChange(value);
              }
            }}
          >
            {LOCK_PERIOD.map((item, index) => (
              <Select.Option value={item} key={index}>
                {!item
                  ? t('No fixed term (Set a lock period will get additional CKTON rewards)')
                  : t('{{count}} Month', { count: item })}
              </Select.Option>
            ))}
          </Select>
        </FormItem>
      )}

      {!!duration && isRing(selectedAsset?.asset) && (
        <FormItem
          name="accept"
          rules={[
            { required: true },
            {
              validator: (_, value) => {
                return !value ? Promise.reject() : Promise.resolve();
              },
              message: t('Check it to continue'),
            },
          ]}
          className="border p-4 rounded-lg bg-gray-200"
          extra={
            <p>
              {t(
                'After setting a lock limit, you will receive an additional {{KTON}} bonus; if you unlock it in advance within the lock limit, you will be charged a penalty of 3 times the {{KTON}} reward.',
                { KTON: assets.find((item) => isKton(item.asset))?.token.symbol }
              )}
            </p>
          }
          valuePropName="checked"
        >
          <Checkbox>{t('I Accept')}</Checkbox>
        </FormItem>
      )}
    </>
  ) : null;
}
