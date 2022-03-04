import { Tabs } from 'antd';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, withRouter } from 'react-router-dom';
import { StakingOverview } from '../components/staking/overview/StakingOverview';
import { Power } from '../components/staking/power/Power';
import { Targets } from '../components/staking/targets/Targets';
import { Waiting } from '../components/staking/waiting/Waiting';
import { StakingProvider } from '../providers/staking';
import { useApi } from '../hooks';
import { CustomTab } from '../components/widget/CustomTab';

type TypeTabKeys = 'power' | 'overview' | 'targets' | 'waiting';

function Page() {
  const { t } = useTranslation();
  const { network } = useApi();
  const { search, pathname } = useLocation();
  const query = useMemo(() => new URLSearchParams(search), [search]);
  const [activeKey, setActiveKey] = useState<TypeTabKeys>((query.get('active') as TypeTabKeys) || 'power');

  return (
    <StakingProvider>
      <Tabs
        activeKey={activeKey}
        onChange={(active) => {
          const url = pathname + '?active=' + active;
          history.pushState({ url }, '', url);
          setActiveKey(active as TypeTabKeys);
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
    </StakingProvider>
  );
}

export const Staking = withRouter(Page);
