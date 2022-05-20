import { Card, Tabs } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccountHistoryProps } from '../staking/interface';
import { useApi } from '../../hooks';
import { CustomTab } from '../widget/CustomTab';
import { BondRecords } from './LockedRecords';
import { BondedRecords } from './BondedRecords';
import { UnbondRecords } from './UnbondRecords';

enum TabsKey {
  locked = 'locked',
  bonded = 'bonded',
  unbond = 'unbond',
}

export function StakingHistory({ tokens }: AccountHistoryProps) {
  const { network } = useApi();
  const { t } = useTranslation();
  const [activeKey, setActiveKey] = useState<TabsKey>(TabsKey.locked);

  return (
    <Card className="relative shadow-xxl">
      <Tabs
        defaultActiveKey={activeKey}
        onChange={(key) => setActiveKey(key as TabsKey)}
        className={`overflow-x-scroll page-account-tabs page-account-tabs-${network.name}`}
      >
        <Tabs.TabPane
          key={TabsKey.locked}
          tab={<CustomTab text={t('Locked')} tabKey={TabsKey.locked} activeKey={activeKey} />}
        >
          <BondRecords tokens={tokens} />
        </Tabs.TabPane>
        <Tabs.TabPane
          key={TabsKey.bonded}
          tab={<CustomTab text={t('Bonded')} tabKey={TabsKey.bonded} activeKey={activeKey} />}
        >
          <BondedRecords />
        </Tabs.TabPane>
        <Tabs.TabPane
          key={TabsKey.unbond}
          tab={<CustomTab text={t('Unbond')} tabKey={TabsKey.unbond} activeKey={activeKey} />}
        >
          <UnbondRecords />
        </Tabs.TabPane>
      </Tabs>
    </Card>
  );
}
