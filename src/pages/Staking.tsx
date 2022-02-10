import { Tabs } from 'antd';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, withRouter } from 'react-router-dom';
import { StakingOverview } from '../components/staking/overview/StakingOverview';
import { Power } from '../components/staking/power/Power';
import { Stats } from '../components/staking/Stats';
import { Targets } from '../components/staking/targets/Targets';
import { Waiting } from '../components/staking/waiting/Waiting';
import { StakingProvider } from '../providers/staking';

function Page() {
  const { t } = useTranslation();
  const { search, pathname } = useLocation();
  const query = useMemo(() => new URLSearchParams(search), [search]);
  const [activeKey, setActiveKey] = useState(query.get('active') || 'power');

  return (
    <StakingProvider>
      <Tabs
        activeKey={activeKey}
        onChange={(active) => {
          const url = pathname + '?active=' + active;
          history.pushState({ url }, '', url);
          setActiveKey(active);
        }}
        className="px-8 w-full mx-auto dark:shadow-none dark:border-transparent"
      >
        <Tabs.TabPane tab={t('Power Manager')} key="power">
          <Power />
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('Staking Overview')} key="overview">
          <StakingOverview />
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('Targets')} key="targets">
          <Targets />
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('Waiting')} key="waiting">
          <Waiting />
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('Validator stats')} key="validator">
          <Stats />
        </Tabs.TabPane>
      </Tabs>
    </StakingProvider>
  );
}

export const Staking = withRouter(Page);
