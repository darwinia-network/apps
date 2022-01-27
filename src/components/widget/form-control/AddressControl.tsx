import { AutoComplete, Form, Input, InputProps } from 'antd';
import { isString, upperFirst } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useAccount, useApi } from '../../../hooks';
import { isSameAddress, isValidAddress } from '../../../utils';
import { CustomFormControl } from './interface';

export function AddressControl({ label, name, disabled, ...rest }: CustomFormControl & InputProps) {
  const { t } = useTranslation();
  const {
    connection: { accounts },
    network,
  } = useApi();
  const { account } = useAccount();

  return (
    <Form.Item
      {...rest}
      name={name}
      label={isString(label) ? t(label) : label}
      rules={[
        { required: true },
        {
          validator(_, value) {
            return !isSameAddress(account, value) ? Promise.resolve() : Promise.reject();
          },
          message: t('The sending address and the receiving address cannot be the same'),
        },
        {
          validator(_, value) {
            return isValidAddress(value, network.name, true) ? Promise.resolve() : Promise.reject();
          },
          message: t('Please enter a valid {{network}} address', { network: upperFirst(network.name) }),
        },
      ]}
    >
      <AutoComplete
        options={accounts.map((item) => ({ label: `${item.meta?.name} - ${item.address}`, value: item.address }))}
        placeholder={t('Enter or select one from these below')}
        disabled={disabled}
      >
        <Input size="large" disabled={disabled} />
      </AutoComplete>
    </Form.Item>
  );
}
