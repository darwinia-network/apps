import { Card, Tabs } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccountStatus } from '../../model';
import { AccountHistoryProps } from '../staking/interface';
import { useApi } from '../../hooks';
import { BondRecords } from './BondRecords';
import { UnbondRecords } from './UnbondRecords';

const CustomTab = (props: { tabText: string; tabKey: AccountStatus; activeKey: AccountStatus }) => (
  <span
    className={`transition-opacity  hover:opacity-80 text-base not-italic text-black ${
      props.tabKey === props.activeKey ? 'font-medium' : 'font-normal opacity-60'
    }`}
  >
    {props.tabText}
  </span>
);

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
        <Tabs.TabPane key="bonded" tab={<CustomTab tabText={t('Bond')} tabKey="bonded" activeKey={activeKey} />}>
          <BondRecords tokens={tokens} />
        </Tabs.TabPane>
        <Tabs.TabPane
          key="unbonding"
          tab={<CustomTab tabText={t('Unbond')} tabKey="unbonding" activeKey={activeKey} />}
        >
          <UnbondRecords />
        </Tabs.TabPane>
      </Tabs>
    </Card>
  );
}
