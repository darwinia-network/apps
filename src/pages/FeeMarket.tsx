import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, Empty } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Overview } from '../components/feemarket/Overview';
import { Relayers } from '../components/feemarket/Relayers';
import { RelayerDetail } from '../components/feemarket/RelayerDetail';
import { Orders } from '../components/feemarket/Orders';
import { OrderDetail } from '../components/feemarket/OrderDetail';
import { useApi, useFeeMarket } from '../hooks';
import { FeeMarketTab, SearchParamsKey } from '../model';
import { GraphqlProvider } from '../providers';
import { CustomTab } from '../components/widget/CustomTab';

// eslint-disable-next-line complexity
export function FeeMarket() {
  const { network } = useApi();
  const { supportedDestinations, destination, setRefresh } = useFeeMarket();
  const { search, pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const searchParams = new URLSearchParams(search);
  const tab = searchParams.get(SearchParamsKey.TAB);
  const orderid = searchParams.get(SearchParamsKey.ORDER);
  const relayer = searchParams.get(SearchParamsKey.RELAYER);

  const [activeKey, setActiveKey] = useState<FeeMarketTab>(
    Object.values(FeeMarketTab).includes(tab as FeeMarketTab) ? (tab as FeeMarketTab) : FeeMarketTab.OVERVIEW
  );

  const [refreshOverview, setRefreshOverview] = useState<() => void>(() => () => undefined);
  const [refreshRelayers, serRefreshRelayers] = useState<() => void>(() => () => undefined);
  const [refreshRelayersDetail, serRefreshRelayersDetail] = useState<() => void>(() => () => undefined);
  const [refreshOrders, setRefreshOrders] = useState<() => void>(() => () => undefined);
  const [refreshOrdersDetail, setRefreshOrdersDetail] = useState<() => void>(() => () => undefined);

  // eslint-disable-next-line complexity
  useEffect(() => {
    switch (activeKey) {
      case FeeMarketTab.OVERVIEW:
        setRefresh(() => refreshOverview);
        break;
      case FeeMarketTab.RELAYERS:
        if (relayer) {
          setRefresh(() => refreshRelayersDetail);
        } else {
          setRefresh(() => refreshRelayers);
        }
        break;
      case FeeMarketTab.OREDERS:
        if (orderid) {
          setRefresh(() => refreshOrdersDetail);
        } else {
          setRefresh(() => refreshOrders);
        }
        break;
    }
  }, [
    activeKey,
    relayer,
    orderid,
    setRefresh,
    refreshOverview,
    refreshRelayers,
    refreshRelayersDetail,
    refreshOrders,
    refreshOrdersDetail,
  ]);

  return supportedDestinations.length && destination ? (
    <GraphqlProvider>
      <Tabs
        activeKey={activeKey}
        onChange={(key) => {
          const searchParams = new URLSearchParams();
          searchParams.set(SearchParamsKey.RPC, encodeURIComponent(network.provider.rpc));
          searchParams.set(SearchParamsKey.DESTINATION, destination);
          searchParams.set(SearchParamsKey.TAB, key);

          navigate(`${pathname}?${searchParams.toString()}`);
          setActiveKey(key as FeeMarketTab);
        }}
        className={`lg:px-8 px-4 w-full mx-auto dark:shadow-none dark:border-transparent pb-5 page-account-tabs page-account-tabs-${network.name}`}
      >
        <Tabs.TabPane
          key={FeeMarketTab.OVERVIEW}
          tab={<CustomTab text={t('Overview')} tabKey={FeeMarketTab.OVERVIEW} activeKey={activeKey} />}
        >
          <Overview destination={destination} setRefresh={setRefreshOverview} />
        </Tabs.TabPane>
        <Tabs.TabPane
          key={FeeMarketTab.RELAYERS}
          tab={<CustomTab text={t('Relayers')} tabKey={FeeMarketTab.RELAYERS} activeKey={activeKey} />}
        >
          {relayer ? (
            <RelayerDetail relayer={relayer} destination={destination} setRefresh={serRefreshRelayersDetail} />
          ) : (
            <Relayers destination={destination} setRefresh={serRefreshRelayers} />
          )}
        </Tabs.TabPane>
        <Tabs.TabPane
          key={FeeMarketTab.OREDERS}
          tab={<CustomTab text={t('Orders')} tabKey={FeeMarketTab.OREDERS} activeKey={activeKey} />}
        >
          {orderid ? (
            <OrderDetail orderid={orderid} destination={destination} setRefresh={setRefreshOrdersDetail} />
          ) : (
            <Orders destination={destination} setRefresh={setRefreshOrders} />
          )}
        </Tabs.TabPane>
      </Tabs>
    </GraphqlProvider>
  ) : (
    <div className="flex justify-center items-center" style={{ height: '65vh' }}>
      <Empty description={t('Coming soon')} />
    </div>
  );
}
