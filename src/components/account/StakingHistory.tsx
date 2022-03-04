import { Card, Tabs } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccountStatus } from '../../model';
import { AccountHistoryProps } from '../staking/interface';
import { useApi } from '../../hooks';
import { CustomTab } from '../widget/CustomTab';
import { BondRecords } from './BondRecords';
import { UnbondRecords } from './UnbondRecords';

export function StakingHistory({ tokens }: AccountHistoryProps) {
  const [activeKey, setActiveKey] = useState<AccountStatus>('bonded');
  const { t } = useTranslation();
  const { network } = useApi();

  return (
    <Card className="relative shadow-xxl">
      <Tabs
        defaultActiveKey={activeKey}
        onChange={(key) => setActiveKey(key as AccountStatus)}
        className={`overflow-x-scroll page-account-tabs page-account-tabs-${network.name}`}
      >
        <Tabs.TabPane key="bonded" tab={<CustomTab text={t('Bond')} tabKey="bonded" activeKey={activeKey} />}>
          <BondRecords tokens={tokens} />
        </Tabs.TabPane>
        <Tabs.TabPane key="unbonding" tab={<CustomTab text={t('Unbond')} tabKey="unbonding" activeKey={activeKey} />}>
          <UnbondRecords />
        </Tabs.TabPane>
      </Tabs>
    </Card>
  );
}
