import { Form, Input, Tabs, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import web3 from 'web3';
import { Withdraw } from '../components/toolbox/withdraw';
import { useApi } from '../hooks';
import { MetamaskProvider } from '../providers/metamask';
import { convertToSS58, dvmAddressToAccountId } from '../utils';

function Page() {
  const { t } = useTranslation();
  const {
    network: { ss58Prefix },
  } = useApi();
  const [address, setAddress] = useState('');

  return (
    <MetamaskProvider>
      <Tabs className="lg:px-8 px-4 w-full mx-auto dark:shadow-none dark:border-transparent">
        <Tabs.TabPane tab={t('DVM Address')} key="address">
          <Form layout="vertical">
            <Form.Item
              label={t('DVM account')}
              name="address"
              rules={[
                {
                  validator(_, value) {
                    return web3.utils.isAddress(value) ? Promise.resolve() : Promise.reject();
                  },
                  message: t('Address Invalid'),
                },
              ]}
            >
              <Input
                onChange={(event) => {
                  const value = event.target.value;
                  const addr = web3.utils.isAddress(value) ? value : '';

                  setAddress(addr);
                }}
                allowClear
                size="large"
              />
            </Form.Item>

            {address && (
              <Form.Item label={t('The resulting darwinia network account id is')}>
                <div className="bg-white w-full rounded-lg p-4">
                  <Typography.Text copyable>
                    {convertToSS58(dvmAddressToAccountId(address).toString(), ss58Prefix)}
                  </Typography.Text>
                </div>
              </Form.Item>
            )}
          </Form>
        </Tabs.TabPane>

        <Tabs.TabPane tab={t('DVM Withdraw')} key="withdraw">
          <Withdraw />
        </Tabs.TabPane>
      </Tabs>
    </MetamaskProvider>
  );
}

export const Toolbox = withRouter(Page);
