import { Tabs, Empty } from 'antd';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { StakingOverview } from '../components/staking/overview/StakingOverview';
import { Power } from '../components/staking/power/Power';
import { Targets } from '../components/staking/targets/Targets';
import { Waiting } from '../components/staking/waiting/Waiting';
import { useApi, useStaking } from '../hooks';
import { SearchParamsKey } from '../model';
import { CustomTab } from '../components/widget/CustomTab';

type TypeTabKeys = 'power' | 'overview' | 'targets' | 'waiting';

export function Staking() {
  const { t } = useTranslation();
  const { network } = useApi();
  const { isSupportedStaking } = useStaking();
  const { search, pathname } = useLocation();
  const navigate = useNavigate();
  const query = useMemo(() => new URLSearchParams(search), [search]);
  const [activeKey, setActiveKey] = useState<TypeTabKeys>((query.get(SearchParamsKey.TAB) as TypeTabKeys) || 'power');

  return isSupportedStaking ? (
    <Tabs
      activeKey={activeKey}
      onChange={(key) => {
        const searchParams = new URLSearchParams();
        searchParams.set(SearchParamsKey.RPC, encodeURIComponent(network.provider.rpc));
        searchParams.set(SearchParamsKey.TAB, key);

        navigate(`${pathname}?${searchParams.toString()}`);
        setActiveKey(key as TypeTabKeys);
      }}
      className={`lg:px-8 px-4 w-full mx-auto dark:shadow-none dark:border-transparent pb-5 page-account-tabs page-account-tabs-${network.name}`}
    >
      <Tabs.TabPane key="power" tab={<CustomTab text={t('Power Manager')} tabKey="power" activeKey={activeKey} />}>
        <Power />
      </Tabs.TabPane>
      <Tabs.TabPane
        key="overview"
        tab={<CustomTab text={t('Staking Overview')} tabKey="overview" activeKey={activeKey} />}
      >
        <StakingOverview />
      </Tabs.TabPane>
      <Tabs.TabPane key="targets" tab={<CustomTab text={t('Targets')} tabKey="targets" activeKey={activeKey} />}>
        <Targets />
      </Tabs.TabPane>
      <Tabs.TabPane key="waiting" tab={<CustomTab text={t('Waiting')} tabKey="waiting" activeKey={activeKey} />}>
        <Waiting />
      </Tabs.TabPane>
    </Tabs>
  ) : (
    <div className="flex justify-center items-center" style={{ height: '65vh' }}>
      <Empty description={t('Parachain now does not support staking')} />
    </div>
  );
}
