import { Select } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi, useStaking } from '../../../hooks';
import { CustomFormControlProps } from '../../../model';
import { IdentAccountAddress } from '../account/IdentAccountAddress';
import { Label } from './Label';

export type PayeeType = 'Staked' | 'Stash' | 'Controller' | 'Account';

export interface Payee {
  type: PayeeType;
  account: string;
}

export function PayeeControl({ onChange, value }: CustomFormControlProps<Payee>) {
  const { t } = useTranslation();
  const { controllerAccount, stashAccount } = useStaking();
  const [type, setType] = useState<PayeeType>(value?.type ?? 'Staked');
  const {
    connection: { accounts },
  } = useApi();
  const triggerChange = useCallback(
    (val: Payee) => {
      if (onChange) {
        onChange(val);
      }
    },
    [onChange]
  );
  const options = useMemo<(Payee & { label: string })[]>(
    () => [
      {
        type: 'Staked',
        account: stashAccount,
        label: t('Stash account (increase the amount at stake)'),
      },
      {
        type: 'Stash',
        account: stashAccount,
        label: t('Stash account (do not increase the amount at stake)'),
      },
      {
        type: 'Controller',
        account: controllerAccount,
        label: t('Controller account'),
      },
      {
        type: 'Account',
        account: '',
        label: t('Other Account'),
      },
    ],
    [controllerAccount, stashAccount, t]
  );

  return (
    <>
      <Select<PayeeType>
        size="large"
        onChange={(opt) => {
          setType(opt);
          triggerChange({ account: options.find((item) => item.type === opt)?.account ?? stashAccount, type: opt });
        }}
        value={value?.type}
      >
        {options.map((item) => (
          <Select.Option key={item.type} value={item.type}>
            {item.label}
          </Select.Option>
        ))}
      </Select>

      {type === 'Account' && (
        <FormItem
          label={<Label text={t('Payment account')} info={t('An account that is to receive the rewards.')} />}
          rules={[{ required: true }]}
          className="mt-4"
          required
        >
          <Select
            size="large"
            onChange={(address: string) => {
              triggerChange({ account: address, type });
            }}
            value={value?.account}
          >
            {accounts.map((item, index) => (
              <Select.Option value={item.address} key={item.address || index}>
                <IdentAccountAddress account={item} />
              </Select.Option>
            ))}
          </Select>
        </FormItem>
      )}
    </>
  );
}
