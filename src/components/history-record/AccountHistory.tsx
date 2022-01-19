import { Card, Tabs } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccountStatus } from '../../model';
import { Bound } from './Bound';
import { AccountHistoryProps } from './interface';
import { Unbonding } from './Unbonding';

export function AccountHistory({ tokens }: AccountHistoryProps) {
  const [activeKey, setActiveKey] = useState<AccountStatus>('bonded');
  const { t } = useTranslation();

  return (
    <Card className="relative">
      <Tabs defaultActiveKey={activeKey} onChange={(key) => setActiveKey(key as AccountStatus)}>
        <Tabs.TabPane tab={t('Bound')} key="bonded">
          <Bound tokens={tokens} />
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('Unbound')} key="unbond">
          <Unbonding />
        </Tabs.TabPane>
        {/*  TODO: cross chain record remove it ? */}
        <Tabs.TabPane disabled tab={t('Mapping')} key="mapping">
          {/* <Table columns={columns} /> */}
        </Tabs.TabPane>
      </Tabs>
    </Card>
  );
}
