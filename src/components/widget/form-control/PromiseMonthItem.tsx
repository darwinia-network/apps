import { Select, Checkbox } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import { isString, upperCase } from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from '../../../hooks';
import { Asset, CustomFormItemProps } from '../../../model';
import { isRing, isKton } from '../../../utils';
import { Label } from './Label';

const MAX_PERIOD = 36;
const LOCK_PERIOD = [0, ...new Array(MAX_PERIOD).fill(0).map((_, index) => index + 1)];

interface PromiseMonthItemProps extends CustomFormItemProps<number> {
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
        <FormItem
          name={name}
          label={
            <Label
              text={isString(label) ? t(label) : label}
              info={t('During the limited time, staked funds will not be available')}
            />
          }
          rules={[{ required: true }]}
          extra={<p className="text-xs">{t('The funds status will become locked after freezing period set')}</p>}
        >
          <Select<number>
            size="large"
            onChange={(value) => {
              setDuration(value);

              if (onChange) {
                onChange(value);
              }
            }}
          >
            {LOCK_PERIOD.map((item, index) => (
              <Select.Option value={item} key={index}>
                {!item
                  ? t('No fixed term Set a lock period will get additional {{symbol}} rewards', {
                      symbol: upperCase(assets.find((asset) => isKton(asset.asset))?.token.symbol ?? 'kton'),
                    })
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
