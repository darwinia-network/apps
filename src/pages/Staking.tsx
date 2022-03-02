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

const TAB_KEY_POWER = 'power';
const TAB_KEY_OVERVIEW = 'overview';
const TAB_KEY_TARGETS = 'targets';
const TAB_KEY_WAITING = 'waiting';

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
  const { search, pathname } = useLocation();
  const query = useMemo(() => new URLSearchParams(search), [search]);
  const [activeKey, setActiveKey] = useState(query.get('active') || TAB_KEY_POWER);

  return (
    <StakingProvider>
      <Tabs
        activeKey={activeKey}
        onChange={(active) => {
          const url = pathname + '?active=' + active;
          history.pushState({ url }, '', url);
          setActiveKey(active);
        }}
        className={`lg:px-8 px-4 w-full mx-auto dark:shadow-none dark:border-transparent page-account-tabs page-account-tabs-${network.name}`}
      >
        <Tabs.TabPane
          tab={<CustomTab tabText={t('Power Manager')} tabKey={TAB_KEY_POWER} activeKey={activeKey} />}
          key={TAB_KEY_POWER}
        >
          <Power />
        </Tabs.TabPane>
        <Tabs.TabPane
          key={TAB_KEY_OVERVIEW}
          tab={<CustomTab tabText={t('Staking Overview')} tabKey={TAB_KEY_OVERVIEW} activeKey={activeKey} />}
        >
          <StakingOverview />
        </Tabs.TabPane>
        <Tabs.TabPane
          key={TAB_KEY_TARGETS}
          tab={<CustomTab tabText={t('Targets')} tabKey={TAB_KEY_TARGETS} activeKey={activeKey} />}
        >
          <Targets />
        </Tabs.TabPane>
        <Tabs.TabPane
          key={TAB_KEY_WAITING}
          tab={<CustomTab tabText={t('Waiting')} tabKey={TAB_KEY_WAITING} activeKey={activeKey} />}
        >
          <Waiting />
        </Tabs.TabPane>
      </Tabs>
    </StakingProvider>
  );
}

export const Staking = withRouter(Page);
