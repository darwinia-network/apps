import { Tabs } from 'antd';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ConvertAddress } from '../components/toolbox/address';
import { Withdraw } from '../components/toolbox/withdraw';
import { Deposits } from '../components/toolbox/deposits/';
import { Faucet } from '../components/toolbox/faucet';
import { useApi } from '../hooks';
import { EVMChainConfig } from '../model';
import { MetamaskProvider } from '../providers/metamask';

export function Toolbox() {
  const { t } = useTranslation();
  const { network } = useApi();

  const { name, evm: supportEvm } = network as EVMChainConfig;

  const supportFaucet = useMemo(() => name === 'pangolin' || name === 'pangoro', [name]);

  return (
    <MetamaskProvider>
      <Tabs
        className={`lg:px-8 px-4 w-full mx-auto dark:shadow-none dark:border-transparent pb-5 page-account-tabs page-account-tabs-${name}`}
      >
        {supportEvm && (
          <Tabs.TabPane tab={t('EVM Address')} key="address">
            <ConvertAddress />
          </Tabs.TabPane>
        )}

        {supportFaucet && (
          <Tabs.TabPane tab={t('Faucet')} key="faucet">
            <Faucet />
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
