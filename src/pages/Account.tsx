import { Button, Card, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { useState } from 'react';
import { StakingHistory } from '../components/account/StakingHistory';
import { AssetOverview } from '../components/account/AssetOverview';
import { useAccount, useApi } from '../hooks';

const TAB_KEY_ASSET = 'asset';
const TAB_KEY_CROSS = 'cross';

const CustomTab = (props: { tabText: string; tabKey: string; activeKey: string }) => (
  <span
    className={`transition-opacity  hover:opacity-80 text-base not-italic text-black ${
      props.tabKey === props.activeKey ? 'font-medium' : 'font-normal opacity-60'
    }`}
  >
    {props.tabText}
  </span>
);

function Page() {
  const { t } = useTranslation();
  const { network } = useApi();
  const { assets, getBalances } = useAccount();
  const [tabActiveKey, setTabActiveKey] = useState(TAB_KEY_ASSET);

  const onTabPaneChange = (activeKey: string) => {
    setTabActiveKey(activeKey);
  };

  return (
    <Tabs
      onChange={onTabPaneChange}
      className={`lg:px-8 px-4 w-full mx-auto dark:shadow-none dark:border-transparent pb-5 page-account-tabs page-account-tabs-${network.name}`}
    >
      <Tabs.TabPane
        key={TAB_KEY_ASSET}
        tab={<CustomTab tabText={t('Darwinia Asset')} tabKey={TAB_KEY_ASSET} activeKey={tabActiveKey} />}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {assets.map((item, index) => (
            <AssetOverview asset={item} key={index} refresh={getBalances}></AssetOverview>
          ))}
        </div>

        <StakingHistory tokens={assets.map((item) => item.token)} />
      </Tabs.TabPane>

      <Tabs.TabPane
        key={TAB_KEY_CROSS}
        tab={<CustomTab tabText={t('Cross Chain')} tabKey={TAB_KEY_CROSS} activeKey={tabActiveKey} />}
      >
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
