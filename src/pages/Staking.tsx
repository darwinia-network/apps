import { Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Power } from '../components/staking/Power';
import { StakingOverview } from '../components/staking/StakingOverview';
import { Stats } from '../components/staking/Stats';
import { Targets } from '../components/staking/Targets';
import { Waiting } from '../components/staking/Waiting';
import { StakingAccountProvider } from '../providers/staking';

function Page() {
  const { t } = useTranslation();

  return (
    <StakingAccountProvider>
      <Tabs className="px-8 w-full mx-auto dark:shadow-none dark:border-transparent">
        <Tabs.TabPane tab={t('Power Manager')} key="power">
          <Power />
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('Staking Overview')} key="staking">
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
    </StakingAccountProvider>
  );
}

export const Staking = withRouter(Page);
