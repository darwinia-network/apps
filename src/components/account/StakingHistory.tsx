import { Card, Tabs } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccountStatus } from '../../model';
import { AccountHistoryProps } from '../staking/interface';
import { Bond } from './Bond';
import { Unbond } from './Unbond';

export function StakingHistory({ tokens }: AccountHistoryProps) {
  const [activeKey, setActiveKey] = useState<AccountStatus>('bonded');
  const { t } = useTranslation();

  return (
    <Card className="relative">
      <Tabs defaultActiveKey={activeKey} onChange={(key) => setActiveKey(key as AccountStatus)}>
        <Tabs.TabPane tab={t('Bond')} key="bonded">
          <Bond tokens={tokens} />
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('Unbond')} key="unbond">
          <Unbond />
        </Tabs.TabPane>
        {/* TODO: cross chain record remove it ? */}
        <Tabs.TabPane disabled tab={t('Mapping')} key="mapping">
          {/* <Table columns={columns} /> */}
        </Tabs.TabPane>
      </Tabs>
    </Card>
  );
}
