import { AutoComplete, Form, InputProps, Select } from 'antd';
import { isString, upperFirst } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useAccount, useApi } from '../../../hooks';
import { CustomFormItemProps } from '../../../model';
import { fromWei, isSpecifiedSS58Address, prettyNumber } from '../../../utils';
import { IdentAccountAddress } from '../account/IdentAccountAddress';

export function AddressItem({ label, disabled, rules = [], ...rest }: CustomFormItemProps & InputProps) {
  const { t } = useTranslation();
  const {
    connection: { accounts },
    network,
  } = useApi();
  const { assets } = useAccount();

  return (
    <Form.Item
      label={isString(label) ? t(label) : label}
      extra={
        <span className="inline-flex items-center gap-2 text-xs">
          <span>{t('transferrable')}: </span>
          {assets.map((item) => (
            <span key={item.asset}>
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
            return isSpecifiedSS58Address(value, network.ss58Prefix) ? Promise.resolve() : Promise.reject();
          },
          message: t('Please enter a valid {{network}} address', { network: upperFirst(network.name) }),
        },
        ...rules,
      ]}
    >
      {disabled ? (
        <Select placeholder={t('Select one from these below')} size="large" showSearch className="flex-1" disabled>
          {accounts.map((item) => (
            <Select.Option value={item.address} key={item.address}>
              <IdentAccountAddress account={item} />
            </Select.Option>
          ))}
        </Select>
      ) : (
        <AutoComplete placeholder={t('Enter or select one from these below')} size="large" className="flex-1">
          {accounts.map((item) => (
            <AutoComplete.Option value={item.address} key={item.address}>
              <IdentAccountAddress account={item} />
            </AutoComplete.Option>
          ))}
        </AutoComplete>
      )}
    </Form.Item>
  );
}
