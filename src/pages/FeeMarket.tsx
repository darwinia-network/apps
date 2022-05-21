import { withRouter } from 'react-router-dom';
import { Tabs } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Overview } from '../components/feemarket/Overview';
import { Relayers } from '../components/feemarket/Relayers';
import { Orders } from '../components/feemarket/Orders';
import { useApi } from '../hooks';
import { CustomTab } from '../components/widget/CustomTab';

enum TabsKeys {
  overview = 'overview',
  relayers = 'relayers',
  orders = 'orders',
}

function Page() {
  const { network } = useApi();
  const { t } = useTranslation();
  const [activeKey, setActiveKey] = useState<TabsKeys>(TabsKeys.relayers);

  return (
    <Tabs
      activeKey={activeKey}
      onChange={(key) => setActiveKey(key as TabsKeys)}
      className={`lg:px-8 px-4 w-full mx-auto dark:shadow-none dark:border-transparent pb-5 page-account-tabs page-account-tabs-${network.name}`}
    >
      <Tabs.TabPane
        key={TabsKeys.overview}
        tab={<CustomTab text={t('Overview')} tabKey={TabsKeys.overview} activeKey={activeKey} />}
      >
        <Overview />
      </Tabs.TabPane>
      <Tabs.TabPane
        key={TabsKeys.relayers}
        tab={<CustomTab text={t('Relayers')} tabKey={TabsKeys.relayers} activeKey={activeKey} />}
      >
        <Relayers />
      </Tabs.TabPane>
      <Tabs.TabPane
        key={TabsKeys.orders}
        tab={<CustomTab text={t('Orders')} tabKey={TabsKeys.orders} activeKey={activeKey} />}
      >
        <Orders />
      </Tabs.TabPane>
    </Tabs>
  );
}

export const FeeMarket = withRouter(Page);
