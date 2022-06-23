import { Card, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Option } from '@polkadot/types';
import { AccountHistoryProps } from '../staking/interface';
import { useApi, useAccount } from '../../hooks';
import { CustomTab } from '../widget/CustomTab';
import type { DarwiniaStakingStructsStakingLedger } from '../../api-derive/types';
import { BondRecords } from './BondRecords';
import { UnbondRecords } from './UnbondRecords';
import { LockedRecords } from './LockedRecords';

enum TabState {
  LOCKS = 'Locks',
  UNBONDING = 'Unbonding',
  UNBONDED = 'Unbonded',
}

export function StakingHistory({ tokens }: AccountHistoryProps) {
  const { api, network } = useApi();
  const { account } = useAccount();
  const { t } = useTranslation();
  const [activeKey, setActiveKey] = useState(TabState.LOCKS);
  const [ledger, setLedger] = useState<DarwiniaStakingStructsStakingLedger | null>();

  useEffect(() => {
    if (!account?.displayAddress) {
      setLedger(null);
      return;
    }

    let unsub: () => void;

    (async () => {
      unsub = await api.query.staking.ledger(
        account.displayAddress,
        (res: Option<DarwiniaStakingStructsStakingLedger>) => {
          setLedger(res.isSome ? res.unwrap() : null);
        }
      );
    })();

    return () => unsub();
  }, [api, account?.displayAddress]);

  return (
    <Card className="relative shadow-xxl">
      <Tabs
        defaultActiveKey={activeKey}
        onChange={(key) => setActiveKey(key as TabState)}
        className={`overflow-x-scroll page-account-tabs page-account-tabs-${network.name}`}
      >
        <Tabs.TabPane
          key={TabState.LOCKS}
          tab={<CustomTab text={t(TabState.LOCKS)} tabKey={TabState.LOCKS} activeKey={activeKey} />}
        >
          <LockedRecords locks={ledger?.depositItems || []} />
        </Tabs.TabPane>
        <Tabs.TabPane
          key={TabState.UNBONDING}
          tab={<CustomTab text={t(TabState.UNBONDING)} tabKey={TabState.UNBONDING} activeKey={activeKey} />}
        >
          <BondRecords tokens={tokens} />
        </Tabs.TabPane>
        <Tabs.TabPane
          key={TabState.UNBONDED}
          tab={<CustomTab text={t(TabState.UNBONDED)} tabKey={TabState.UNBONDED} activeKey={activeKey} />}
        >
          <UnbondRecords />
        </Tabs.TabPane>
      </Tabs>
    </Card>
  );
}
