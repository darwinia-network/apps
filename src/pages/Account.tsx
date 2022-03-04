import { Button, Card, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { useState } from 'react';
import { StakingHistory } from '../components/account/StakingHistory';
import { AssetOverview } from '../components/account/AssetOverview';
import { useAccount, useApi } from '../hooks';
import { CustomTab } from '../components/widget/CustomTab';

type TypeTabKeys = 'asset' | 'cross';

function Page() {
  const { t } = useTranslation();
  const { network } = useApi();
  const { assets, getBalances } = useAccount();
  const [activeKey, setActiveKey] = useState<TypeTabKeys>('asset');

  return (
    <Tabs
      onChange={(key) => setActiveKey(key as TypeTabKeys)}
      className={`lg:px-8 px-4 w-full mx-auto dark:shadow-none dark:border-transparent pb-5 page-account-tabs page-account-tabs-${network.name}`}
    >
      <Tabs.TabPane key="asset" tab={<CustomTab text={t('Darwinia Asset')} tabKey="asset" activeKey={activeKey} />}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {assets.map((item, index) => (
            <AssetOverview asset={item} key={index} refresh={getBalances}></AssetOverview>
          ))}
        </div>

        <StakingHistory tokens={assets.map((item) => item.token)} />
      </Tabs.TabPane>

      <Tabs.TabPane key="cross" tab={<CustomTab text={t('Cross Chain')} tabKey="cross" activeKey={activeKey} />}>
        <Card className="shadow-xxl">
          <p className="mb-4 opacity-60">
            {t('You can transfer RING/KTON through the cross-chain bridge between Ethereum and Darwinia.')}
          </p>
          <Button
            type="primary"
            onClick={() => {
              window.open('https://wormhole.darwinia.network', '_blank');
            }}
          >
            {t('Go to Wormhole')}
          </Button>
        </Card>
      </Tabs.TabPane>
    </Tabs>
  );
}

export const Account = withRouter(Page);
