import { Select } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../../hooks';
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
  const [type, setType] = useState<PayeeType>(value?.type ?? 'Staked');
  const [account, setAccount] = useState<string>(value?.account ?? '');
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

  return (
    <>
      <Select<PayeeType>
        size="large"
        onChange={(opt) => {
          setType(opt);
          triggerChange({ account, type: opt });
        }}
        value={value?.type}
      >
        <Select.Option value="Staked">{t('Stash account (increase the amount at stake)')}</Select.Option>
        <Select.Option value="Stash">{t('Stash account (do not increase the amount at stake)')}</Select.Option>
        <Select.Option value="Controller">{t('Controller account')}</Select.Option>
        <Select.Option value="Account">{t('Other Account')}</Select.Option>
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
              setAccount(address);
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
