import { createRef, useMemo } from 'react';
import { AutoComplete, Form, Input, InputProps, Select } from 'antd';
import { isString, upperFirst } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useAccount, useApi, useWallet } from '../../../hooks';
import { CustomFormItemProps } from '../../../model';
import { fromWei, isSpecifiedSS58Address, prettyNumber, isValidEthAddress } from '../../../utils';
import { IdentAccountAddress } from '../account/IdentAccountAddress';

export function AddressItem({
  label,
  canEth,
  disabled,
  rules = [],
  ...rest
}: CustomFormItemProps & InputProps & { canEth?: boolean }) {
  const { t } = useTranslation();
  const { network } = useApi();
  const { accounts } = useWallet();
  const { assets } = useAccount();
  const autoCompleteInputRef = createRef<Input>();
  const autoCompleteOptions = useMemo<{ value: string; label: JSX.Element }[]>(
    () => accounts.map((item) => ({ value: item.displayAddress, label: <IdentAccountAddress account={item} /> })),
    [accounts]
  );

  return (
    <Form.Item
      label={isString(label) ? t(label) : label}
      extra={
        <span className="inline-flex items-center gap-2 text-xs">
          <span>{t('available')}: </span>
          {assets.map((item) => (
            <span key={item.token.symbol}>
              <span>{fromWei({ value: item.max }, prettyNumber)}</span>
              <span className="uppercase">{item.token.symbol}</span>
            </span>
          ))}
        </span>
      }
      {...rest}
      rules={[
        { required: true },
        {
          validator(_, value) {
            return isSpecifiedSS58Address(value, network.ss58Prefix) || (canEth ? isValidEthAddress(value) : false)
              ? Promise.resolve()
              : Promise.reject();
          },
          message: t('Please enter a valid {{network}} address', { network: upperFirst(network.name) }),
        },
        ...rules,
      ]}
    >
      {disabled ? (
        <Select placeholder={t('Select one from these below')} size="large" showSearch className="flex-1" disabled>
          {accounts.map((item) => (
            <Select.Option value={item.displayAddress} key={item.displayAddress}>
              <IdentAccountAddress account={item} />
            </Select.Option>
          ))}
        </Select>
      ) : (
        <AutoComplete options={autoCompleteOptions} className="flex-1">
          <Input
            type="search"
            size="large"
            ref={autoCompleteInputRef}
            placeholder={t('Enter or select one from these below')}
            onFocus={() => autoCompleteInputRef.current?.select()}
            onClick={() => autoCompleteInputRef.current?.select()}
          />
        </AutoComplete>
      )}
    </Form.Item>
  );
}
