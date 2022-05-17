import { withRouter } from 'react-router-dom';
import { Tabs } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Overview } from '../components/feemarket/Overview';
import { useApi } from '../hooks';
import { CustomTab } from '../components/widget/CustomTab';

type TypeTabKeys = 'overview' | 'relayers' | 'orders';

function Page() {
  const { network } = useApi();
  const { t } = useTranslation();
  const [activeKey, setActiveKey] = useState<TypeTabKeys>('overview');

  return (
    <Tabs
      onChange={(key) => setActiveKey(key as TypeTabKeys)}
      className={`lg:px-8 px-4 w-full mx-auto dark:shadow-none dark:border-transparent pb-5 page-account-tabs page-account-tabs-${network.name}`}
    >
      <Tabs.TabPane key="overview" tab={<CustomTab text={t('Overview')} tabKey="overview" activeKey={activeKey} />}>
        <Overview />
      </Tabs.TabPane>
    </Tabs>
  );
}

export const FeeMarket = withRouter(Page);
