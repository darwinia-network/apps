import { Card, Tabs } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccountStatus } from '../../model';
import { AccountHistoryProps } from '../staking/interface';
import { BondRecords } from './BondRecords';
import { UnbondRecords } from './UnbondRecords';

export function StakingHistory({ tokens }: AccountHistoryProps) {
  const [activeKey, setActiveKey] = useState<AccountStatus>('bonded');
  const { t } = useTranslation();

  return (
    <Card className="relative">
      <Tabs
        defaultActiveKey={activeKey}
        onChange={(key) => setActiveKey(key as AccountStatus)}
        className="overflow-x-scroll"
      >
        <Tabs.TabPane tab={t('Bond')} key="bonded">
          <BondRecords tokens={tokens} />
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('Unbond')} key="unbond">
          <UnbondRecords />
        </Tabs.TabPane>
        {/* TODO: cross chain record remove it ? */}
        <Tabs.TabPane disabled tab={t('Mapping')} key="mapping">
          {/* <Table columns={columns} /> */}
        </Tabs.TabPane>
      </Tabs>
    </Card>
  );
}
