import { Form, Input, Typography, Card } from 'antd';
import { useState } from 'react';
import web3 from 'web3';
import { Trans, useTranslation } from 'react-i18next';
import { useApi } from '../../../hooks';
import { Label } from '../../../components/widget/form-control/Label';
import { convertToSS58, evmAddressToAccountId } from '../../../utils';

export const ConvertAddress = () => {
  const { network } = useApi();
  const { t } = useTranslation();
  const [address, setAddress] = useState('');

  const { ss58Prefix, name } = network;

  return (
    <Card className="max-w-max pb-8">
      <Form layout="vertical" className="max-w-xl lg:w-144">
        <Form.Item
          label={
            <Label
              text={t('EVM account')}
              info={
                <Trans t={t}>
                  Ethereum-compatible Smart Chain Address starting with 0x. More details please refer{' '}
                  <a
                    rel="noopener noreferrer"
                    target="_blank"
                    href="https://darwinianetwork.medium.com/build-on-darwinia-2-1-address-formats-in-darwinia-e964cc91fccc"
                  >
                    here
                  </a>{' '}
                  .
                </Trans>
              }
            />
          }
          name="address"
          rules={[
            {
              validator(_, value) {
                return web3.utils.isAddress(value) ? Promise.resolve() : Promise.reject();
              },
              message: t('Invalid Account'),
            },
          ]}
        >
          <Input
            onChange={(event) => {
              const value = event.target.value;
              const addr = web3.utils.isAddress(value) ? value : '';

              setAddress(addr);
            }}
            placeholder={t('EVM format account e.g.')}
            allowClear
            size="large"
          />
        </Form.Item>

        {address && (
          <Form.Item label={t('The resulting {{network}} network account id is', { network: name })}>
            <div className="bg-white w-full rounded-lg p-4 border">
              <Typography.Text copyable>
                {convertToSS58(evmAddressToAccountId(address).toString(), ss58Prefix)}
              </Typography.Text>
            </div>
          </Form.Item>
        )}
      </Form>
    </Card>
  );
};
