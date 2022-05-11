import { Form, Input, Tabs, Typography, Alert } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import web3 from 'web3';
import { Withdraw } from '../components/toolbox/withdraw';
import { Deposits } from '../components/toolbox/deposits';
import { Label } from '../components/widget/form-control/Label';
import { useApi } from '../hooks';
import { MetamaskProvider } from '../providers/metamask';
import { convertToSS58, dvmAddressToAccountId } from '../utils';

function Page() {
  const { t } = useTranslation();
  const {
    network: { ss58Prefix, name },
  } = useApi();
  const [address, setAddress] = useState('');

  return (
    <MetamaskProvider>
      <Tabs
        className={`lg:px-8 px-4 w-full mx-auto dark:shadow-none dark:border-transparent pb-5 page-account-tabs page-account-tabs-${name}`}
      >
        <Tabs.TabPane tab={t('DVM Address')} key="address">
          <Alert
            message={t(`Darwinia will support DVM soon, but please don't transfer assets to this address now`)}
            type="warning"
            className="mb-2"
          />
          <Form layout="vertical">
            <Form.Item
              label={<Label text={t('DVM account')} info={t('DVM format account ID to Darwinia network account ID')} />}
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
                placeholder={t('DVM format account e.g.')}
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

        <Tabs.TabPane tab={t('DVM Withdraw')} key="withdraw" disabled={name === 'pangoro' || name === 'darwinia'}>
          <Withdraw />
        </Tabs.TabPane>

        <Tabs.TabPane tab={t('Deposits Claim')} key="deposits" disabled={name !== 'darwinia'}>
          <Deposits />
        </Tabs.TabPane>
      </Tabs>
    </MetamaskProvider>
  );
}

export const Toolbox = withRouter(Page);
