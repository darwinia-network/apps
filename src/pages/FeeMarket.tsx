import { withRouter, useLocation } from 'react-router-dom';
import { Tabs, Empty } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Overview } from '../components/feemarket/Overview';
import { Relayers } from '../components/feemarket/Relayers';
import { Orders } from '../components/feemarket/Orders';
import { useApi, useFeeMarket } from '../hooks';
import { FeeMarketTab, SearchParamsKey } from '../model';
import { GraphqlProvider } from '../providers';
import { CustomTab } from '../components/widget/CustomTab';

function Page() {
  const { network } = useApi();
  const { supportedDestinations } = useFeeMarket();
  const { search } = useLocation();
  const { t } = useTranslation();

  const searchParams = new URLSearchParams(search);
  const tab = searchParams.get(SearchParamsKey.TAB);

  const [activeKey, setActiveKey] = useState<FeeMarketTab>(
    Object.values(FeeMarketTab).includes(tab as FeeMarketTab) ? (tab as FeeMarketTab) : FeeMarketTab.OVERVIEW
  );

  return supportedDestinations.length ? (
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
          <Overview />
        </Tabs.TabPane>
        <Tabs.TabPane
          key={FeeMarketTab.RELAYERS}
          tab={<CustomTab text={t('Relayers')} tabKey={FeeMarketTab.RELAYERS} activeKey={activeKey} />}
        >
          <Relayers />
        </Tabs.TabPane>
        <Tabs.TabPane
          key={FeeMarketTab.OREDERS}
          tab={<CustomTab text={t('Orders')} tabKey={FeeMarketTab.OREDERS} activeKey={activeKey} />}
        >
          <Orders />
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
