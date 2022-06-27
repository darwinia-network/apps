import { Card, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Option } from '@polkadot/types';
import type { BlockNumber, Balance } from '@polkadot/types/interfaces';
import { StakingRecordType, UnbondDataSourceState, UnbondType } from '../staking/interface';
import { useApi, useBestNumber, useStaking } from '../../hooks';
import { CustomTab } from '../widget/CustomTab';
import type { DarwiniaStakingStructsStakingLedger } from '../../api-derive/types';
import { UnbondRecords } from './UnbondRecords';
import { LockedRecords } from './LockedRecords';

const calcuUnondedOrUndonding = (
  unbondeds: UnbondDataSourceState[],
  unbondings: UnbondDataSourceState[],
  symbol: string,
  amount: Balance,
  until: BlockNumber,
  currentHeight: number | null | undefined
): [UnbondDataSourceState[], UnbondDataSourceState[]] => {
  if (until.ltn(currentHeight || 0)) {
    return [unbondeds.concat([{ amount, until, status: UnbondType.UNBONDED, symbol }]), [...unbondings]];
  } else {
    return [[...unbondeds], unbondings.concat([{ amount, until, status: UnbondType.UNBONDING, symbol }])];
  }
};

export function StakingRecords() {
  const { api, network } = useApi();
  const { controllerAccount } = useStaking();
  const { bestNumber } = useBestNumber();
  const { t } = useTranslation();
  const [activeKey, setActiveKey] = useState(StakingRecordType.LOCKS);
  const [ledger, setLedger] = useState<DarwiniaStakingStructsStakingLedger | null>();
  const [unbondedDataSource, setUnondedDataSource] = useState<UnbondDataSourceState[]>([]);
  const [unbondingDataSource, setUnondingDataSource] = useState<UnbondDataSourceState[]>([]);

  useEffect(() => {
    if (!controllerAccount) {
      setLedger(null);
      return;
    }

    let unsub: () => void = () => undefined;

    (async () => {
      unsub = await api.query.staking.ledger(controllerAccount, (res: Option<DarwiniaStakingStructsStakingLedger>) => {
        setLedger(res.isSome ? res.unwrap() : null);
      });
    })();

    return () => unsub();
  }, [api, controllerAccount]);

  useEffect(() => {
    const [ringUnbondeds, ringUnbondings] = ledger?.ringStakingLock.unbondings.reduce(
      ([unbondeds, unbondings], { amount, until }) => {
        return calcuUnondedOrUndonding(unbondeds, unbondings, network.tokens.ring.symbol, amount, until, bestNumber);
      },
      [[], []] as [UnbondDataSourceState[], UnbondDataSourceState[]]
    ) || [[], []];

    const [ktonUnbondeds, ktonUnbondings] = ledger?.ktonStakingLock.unbondings.reduce(
      ([unbondeds, unbondings], { amount, until }) => {
        return calcuUnondedOrUndonding(unbondeds, unbondings, network.tokens.kton.symbol, amount, until, bestNumber);
      },
      [[], []] as [UnbondDataSourceState[], UnbondDataSourceState[]]
    ) || [[], []];

    setUnondedDataSource(ringUnbondeds.concat(ktonUnbondeds).sort((a, b) => a.until.cmp(b.until)));
    setUnondingDataSource(ringUnbondings.concat(ktonUnbondings).sort((a, b) => a.until.cmp(b.until)));
  }, [ledger, bestNumber, network.tokens]);

  return (
    <Card className="relative shadow-xxl">
      <Tabs
        defaultActiveKey={activeKey}
        onChange={(key) => setActiveKey(key as StakingRecordType)}
        className={`overflow-x-scroll page-account-tabs page-account-tabs-${network.name}`}
      >
        <Tabs.TabPane
          key={StakingRecordType.LOCKS}
          tab={<CustomTab text={t(StakingRecordType.LOCKS)} tabKey={StakingRecordType.LOCKS} activeKey={activeKey} />}
        >
          <LockedRecords locks={ledger?.depositItems || []} />
        </Tabs.TabPane>
        <Tabs.TabPane
          key={StakingRecordType.UNBONDING}
          tab={
            <CustomTab
              text={t(StakingRecordType.UNBONDING)}
              tabKey={StakingRecordType.UNBONDING}
              activeKey={activeKey}
            />
          }
        >
          <UnbondRecords dataSource={unbondingDataSource} />
        </Tabs.TabPane>
        <Tabs.TabPane
          key={StakingRecordType.UNBONDED}
          tab={
            <CustomTab text={t(StakingRecordType.UNBONDED)} tabKey={StakingRecordType.UNBONDED} activeKey={activeKey} />
          }
        >
          <UnbondRecords dataSource={unbondedDataSource} />
        </Tabs.TabPane>
      </Tabs>
    </Card>
  );
}
