import { withRouter, useLocation } from 'react-router-dom';
import { Tabs, Empty } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Overview } from '../components/feemarket/Overview';
// import { Relayers } from '../components/feemarket/Relayers';
// import { RelayerDetail } from '../components/feemarket/RelayerDetail';
// import { Orders } from '../components/feemarket/Orders';
// import { OrderDetail } from '../components/feemarket/OrderDetail';
import { useApi, useFeeMarket } from '../hooks';
import { FeeMarketTab, SearchParamsKey } from '../model';
import { GraphqlProvider } from '../providers';
import { CustomTab } from '../components/widget/CustomTab';

// eslint-disable-next-line complexity
function Page() {
  const { network } = useApi();
  const { supportedDestinations, destination } = useFeeMarket();
  const { search } = useLocation();
  const { t } = useTranslation();

  const searchParams = new URLSearchParams(search);
  const tab = searchParams.get(SearchParamsKey.TAB);
  // const orderid = searchParams.get(SearchParamsKey.ORDER);
  // const relayer = searchParams.get(SearchParamsKey.RELAYER);

  const [activeKey, setActiveKey] = useState<FeeMarketTab>(
    Object.values(FeeMarketTab).includes(tab as FeeMarketTab) ? (tab as FeeMarketTab) : FeeMarketTab.OVERVIEW
  );

  return supportedDestinations.length && destination ? (
    <GraphqlProvider>
      <Tabs
        activeKey={activeKey}
        onChange={(key) => setActiveKey(key as FeeMarketTab)}
        className={`lg:px-8 px-4 w-full mx-auto dark:shadow-none dark:border-transparent pb-5 page-account-tabs page-account-tabs-${network.name}`}
      >
        <Tabs.TabPane
          key={FeeMarketTab.OVERVIEW}
          tab={<CustomTab text={t('Overview')} tabKey={FeeMarketTab.OVERVIEW} activeKey={activeKey} />}
        >
          <Overview destination={destination} />
        </Tabs.TabPane>
        {/* <Tabs.TabPane
          key={FeeMarketTab.RELAYERS}
          tab={<CustomTab text={t('Relayers')} tabKey={FeeMarketTab.RELAYERS} activeKey={activeKey} />}
        >
          {relayer ? (
            <RelayerDetail relayer={relayer} destination={destination} />
          ) : (
            <Relayers destination={destination} />
          )}
        </Tabs.TabPane> */}
        {/* <Tabs.TabPane
          key={FeeMarketTab.OREDERS}
          tab={<CustomTab text={t('Orders')} tabKey={FeeMarketTab.OREDERS} activeKey={activeKey} />}
        >
          {orderid ? <OrderDetail orderid={orderid} destination={destination} /> : <Orders destination={destination} />}
        </Tabs.TabPane> */}
      </Tabs>
    </GraphqlProvider>
  ) : (
    <div className="flex justify-center items-center" style={{ height: '65vh' }}>
      <Empty description={t('Coming soon')} />
    </div>
  );
}

export const FeeMarket = withRouter(Page);
