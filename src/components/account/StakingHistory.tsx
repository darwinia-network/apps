import { Card, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Option, u64 } from '@polkadot/types';
import type { BlockNumber } from '@polkadot/types/interfaces';
import { forkJoin, from } from 'rxjs';
import { format } from 'date-fns';
import { StakingRecordType, UnbondDataSourceState, UnbondType } from '../staking/interface';
import { useApi, useBestNumber, useStaking, useBlockTime } from '../../hooks';
import { CustomTab } from '../widget/CustomTab';
import type { DarwiniaStakingStructsStakingLedger, DarwiniaSupportStructsUnbonding } from '../../api-derive/types';
import { DATE_FORMAT } from '../../config';
import { UnbondRecords } from './UnbondRecords';
import { LockedRecords } from './LockedRecords';

type CurrentBlockTime = { block: number; time: number };

const calcuUntil = (until: BlockNumber, current: CurrentBlockTime | undefined, period: number) => {
  if (current && period) {
    return format(new Date((until.toNumber() - current.block) * period + current.time), DATE_FORMAT);
  } else {
    return `#${until.toNumber()}`;
  }
};

export function StakingHistory() {
  const { api, network } = useApi();
  const { controllerAccount } = useStaking();
  const { bestNumber } = useBestNumber();
  const [blockTime] = useBlockTime(1); // milliseconds
  const { t } = useTranslation();
  const [activeKey, setActiveKey] = useState(StakingRecordType.LOCKS);
  const [currentBlockTime, setCurrentBlockTime] = useState<CurrentBlockTime>();
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
    const sub$$ = forkJoin([api.rpc.chain.getHeader(), from(api.query.timestamp.now() as Promise<u64>)]).subscribe(
      ([header, now]) => {
        setCurrentBlockTime({
          block: header.number.toNumber(),
          time: now.toNumber(),
        });
      }
    );

    return () => sub$$.unsubscribe();
  }, [api]);

  useEffect(() => {
    const ringUnbondeds: DarwiniaSupportStructsUnbonding[] = [];
    const ringUnbondings: DarwiniaSupportStructsUnbonding[] = [];
    const ktonUnbondeds: DarwiniaSupportStructsUnbonding[] = [];
    const ktonUnbondings: DarwiniaSupportStructsUnbonding[] = [];

    ledger?.ringStakingLock.unbondings.forEach((item) => {
      if (item.until.ltn(bestNumber || 0)) {
        ringUnbondeds.push(item);
      } else {
        ringUnbondings.push(item);
      }
    });

    ledger?.ktonStakingLock.unbondings.forEach((item) => {
      if (item.until.ltn(bestNumber || 0)) {
        ktonUnbondeds.push(item);
      } else {
        ktonUnbondings.push(item);
      }
    });

    setUnondedDataSource(
      ringUnbondeds
        .map((item) => ({
          amount: item.amount,
          until: item.until,
          status: UnbondType.UNBONDED,
          symbol: network.tokens.ring.symbol,
        }))
        .concat(
          ktonUnbondeds.map((item) => ({
            amount: item.amount,
            until: item.until,
            status: UnbondType.UNBONDED,
            symbol: network.tokens.kton.symbol,
          }))
        )
        .sort((a, b) => a.until.cmp(b.until))
        .map((item) => ({ ...item, until: calcuUntil(item.until, currentBlockTime, blockTime) }))
    );

    setUnondingDataSource(
      ringUnbondings
        .map((item) => ({
          amount: item.amount,
          until: item.until,
          status: UnbondType.UNBONDING,
          symbol: network.tokens.ring.symbol,
        }))
        .concat(
          ktonUnbondings.map((item) => ({
            amount: item.amount,
            until: item.until,
            status: UnbondType.UNBONDING,
            symbol: network.tokens.kton.symbol,
          }))
        )
        .sort((a, b) => a.until.cmp(b.until))
        .map((item) => ({ ...item, until: calcuUntil(item.until, currentBlockTime, blockTime) }))
    );
  }, [ledger, bestNumber, network.tokens, currentBlockTime, blockTime]);

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
