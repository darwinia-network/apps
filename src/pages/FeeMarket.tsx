import { withRouter } from 'react-router-dom';
import { Tabs, Empty } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Overview } from '../components/feemarket/Overview';
import { Relayers } from '../components/feemarket/Relayers';
import { RelayerDetail } from '../components/feemarket/RelayerDetail';
import { Orders } from '../components/feemarket/Orders';
import { OrderDetail } from '../components/feemarket/OrderDetail';
import { useApi } from '../hooks';
import { GraphqlProvider } from '../providers';
import { CustomTab } from '../components/widget/CustomTab';

enum TabsKeys {
  overview = 'overview',
  relayers = 'relayers',
  orders = 'orders',
}

function Page() {
  const searchParams = new URL(window.location.href).searchParams;
  const tab = searchParams.get('tab');
  const orderId = searchParams.get('orderid');
  const relayer = searchParams.get('relayer');

  const { network } = useApi();
  const { t } = useTranslation();
  const [activeKey, setActiveKey] = useState<TabsKeys>(
    Object.values(TabsKeys).includes(tab as TabsKeys) ? (tab as TabsKeys) : TabsKeys.overview
  );

  return network.name === 'pangolin' ? (
    <GraphqlProvider>
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
          {relayer ? <RelayerDetail /> : <Relayers />}
        </Tabs.TabPane>
        <Tabs.TabPane
          key={TabsKeys.orders}
          tab={<CustomTab text={t('Orders')} tabKey={TabsKeys.orders} activeKey={activeKey} />}
        >
          {orderId ? <OrderDetail orderId={orderId} /> : <Orders />}
        </Tabs.TabPane>
      </Tabs>
    </GraphqlProvider>
  ) : (
    <div className="flex justify-center items-center" style={{ height: '65vh' }}>
      <Empty description={t('Coming soon')} />
    </div>
  );
}

export const FeeMarket = withRouter(Page);
