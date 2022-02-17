import { Balance } from '@polkadot/types/interfaces';
import { BN_ZERO } from '@polkadot/util';
import { Card, Skeleton, Spin } from 'antd';
import BN from 'bn.js';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from, switchMap } from 'rxjs';
import { useAccount, useApi, useElectedNominators, useIsMountedOperator, useWaitingNominators } from '../../../hooks';
import { fromWei, isKton, isRing, prettyNumber } from '../../../utils';
import { Statistics } from '../../widget/Statistics';
import { Validators } from './Validators';

const formatNum = (value: string) => prettyNumber(value, { decimal: 0 });

// eslint-disable-next-line complexity
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
      <Card className="shadow-xxl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
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
              nominators ? (
                <span>
                  <span>{validatorCount}</span>
                  <span className="px-2">/</span>
                  <span>{nominators?.length}</span>
                </span>
              ) : (
                <Spin />
              )
            }
          />
          <Statistics
            title={t('last reward({{symbol}})', { symbol: ringSymbol })}
            className="border-none"
            value={lastReward ? fromWei({ value: lastReward }, formatNum) : <Spin />}
          />
        </div>
      </Card>

      {elected && waiting ? (
        <Validators data={{ elected, waiting }} lastReward={lastReward ? new BN(lastReward) : new BN(1)} />
      ) : (
        <Card className="my-8 shadow-xxl">
          <Skeleton active />
        </Card>
      )}
    </>
  );
}
