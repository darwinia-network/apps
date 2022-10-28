import { Form, Input, Tabs, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import web3 from 'web3';
import { Withdraw } from '../components/toolbox/withdraw';
import { Deposits } from '../components/toolbox/deposits/';
import { Label } from '../components/widget/form-control/Label';
import { useApi } from '../hooks';
import { EVMChainConfig } from '../model';
import { MetamaskProvider } from '../providers/metamask';
import { convertToSS58, evmAddressToAccountId } from '../utils';

export function Toolbox() {
  const { t } = useTranslation();
  const { network } = useApi();
  const [address, setAddress] = useState('');

  const { ss58Prefix, name, evm: supportEvm } = network as EVMChainConfig;

  return (
    <MetamaskProvider>
      <Tabs
        className={`lg:px-8 px-4 w-full mx-auto dark:shadow-none dark:border-transparent pb-5 page-account-tabs page-account-tabs-${name}`}
      >
        {supportEvm && (
          <Tabs.TabPane tab={t('EVM Address')} key="address">
            <Form layout="vertical" className="max-w-xl">
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
                  <div className="bg-white w-full rounded-lg p-4">
                    <Typography.Text copyable>
                      {convertToSS58(evmAddressToAccountId(address).toString(), ss58Prefix)}
                    </Typography.Text>
                  </div>
                </Form.Item>
              )}
            </Form>
          </Tabs.TabPane>
        )}

        {supportEvm && (
          <Tabs.TabPane tab={t('EVM Withdraw')} key="withdraw">
            <Withdraw />
          </Tabs.TabPane>
        )}

        {name === 'darwinia' && (
          <Tabs.TabPane tab={t('Deposits Claim')} key="deposits">
            <Deposits />
          </Tabs.TabPane>
        )}
      </Tabs>
    </MetamaskProvider>
  );
}
