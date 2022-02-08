import { Balance } from '@polkadot/types/interfaces';
import { BN_ZERO } from '@polkadot/util';
import { Button, Card, Input, Spin } from 'antd';
import Table, { ColumnsType } from 'antd/lib/table';
import BN from 'bn.js';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from, switchMap } from 'rxjs';
import { useAccount, useApi, useElectedNominators, useIsMountedOperator, useWaitingNominators } from '../../../hooks';
import { fromWei, isKton, isRing, prettyNumber } from '../../../utils';
import { Statistics } from '../../widget/Statistics';

const testData = [
  { id: 0, validators: 'xxx', other: '8743104(8)', own: 4848, active: '6%', next: '6%', points: 2660, last: 6157610 },
];

const formatNum = (value: string) => prettyNumber(value, { decimal: 0 });

export function Targets() {
  const { t } = useTranslation();
  const { totalStaked, nominators, sourceData: elected } = useElectedNominators();
  const { totalWaiting, sourceData: waiting } = useWaitingNominators();
  const { api } = useApi();
  const { assets } = useAccount();
  const ringSymbol = useMemo(() => assets.find((item) => isRing(item.asset))?.token.symbol ?? 'ring', [assets]);
  const ktonSymbol = useMemo(() => assets.find((item) => isKton(item.asset))?.token.symbol ?? 'kton', [assets]);
  const total = useMemo(() => totalStaked.add(totalWaiting), [totalStaked, totalWaiting]);

  const validatorCount = useMemo(
    () => (elected && waiting ? prettyNumber(elected.info.length + waiting.info.length) : '0'),
    [elected, waiting]
  );

  const [issuance, setIssuance] = useState<Balance | null>(null);
  const [issuanceKton, setIssuanceKton] = useState<Balance | null>(null);
  const [lastReward, setLastReward] = useState<string | null>(null);
  const { takeWhileIsMounted } = useIsMountedOperator();
  const columns: ColumnsType<Record<string, string | number>> = [
    { title: 'validators', dataIndex: 'validators' },
    { title: 'other stake(power)', dataIndex: 'other' },
    { title: 'own stake(power)', dataIndex: 'own' },
    { title: 'active commission', dataIndex: 'active' },
    { title: 'next commission', dataIndex: 'next' },
    { title: 'points', dataIndex: 'points' },
    { title: 'last #', dataIndex: 'last' },
  ];

  useEffect(() => {
    const issuance$$ = from(api.query.balances.totalIssuance())
      .pipe(takeWhileIsMounted())
      .subscribe((res) => {
        setIssuance(res as Balance);
      });
    const issuanceKton$$ = from(api.query.kton.totalIssuance())
      .pipe(takeWhileIsMounted())
      .subscribe((res) => {
        setIssuanceKton(res as Balance);
      });

    const last$$ = from(api.derive.session.indexes())
      .pipe(
        switchMap(({ activeEra }) => {
          const last = activeEra.gtn(0) ? activeEra.subn(1) : BN_ZERO;

          return api.query.staking.erasValidatorReward([last]);
        }),
        takeWhileIsMounted()
      )
      .subscribe((res) => {
        setLastReward((res as BN).toString());
      });

    return () => {
      issuance$$.unsubscribe();
      issuanceKton$$.unsubscribe();
      last$$.unsubscribe();
    };
  }, [api, takeWhileIsMounted]);

  return (
    <>
      <Card>
        <div className="grid grid-cols-5">
          <Statistics title={t('total staked(Power)')} value={total ? prettyNumber(total) : <Spin />} />
          <Statistics
            title={t('total issuance({{symbol}})', { symbol: ringSymbol })}
            value={issuance ? fromWei({ value: issuance }, formatNum) : <Spin />}
          />
          <Statistics
            title={t('total issuance({{symbol}})', { symbol: ktonSymbol })}
            value={issuance ? fromWei({ value: issuanceKton }, formatNum) : <Spin />}
          />
          <Statistics
            title={t('validators/nominators')}
            value={
              <span>
                <span>{validatorCount}</span>
                <span className="px-2">/</span>
                <span>{nominators?.length}</span>
              </span>
            }
          />
          <Statistics
            title={t('last reward({{symbol}})', { symbol: ringSymbol })}
            className="border-none"
            value={lastReward ? fromWei({ value: lastReward }, formatNum) : <Spin />}
          />
        </div>
      </Card>

      <div className="flex justify-between items-center">
        <Input size="large" placeholder={t('Flite by name, address or index')} className="my-8 w-1/3" />
        <Button type="primary">{t('Nominate selected')}</Button>
      </div>

      <Card>
        <Table rowKey={'id'} dataSource={testData} columns={columns} />
      </Card>
    </>
  );
}
