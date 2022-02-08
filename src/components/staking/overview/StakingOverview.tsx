import { DeriveSessionProgress } from '@polkadot/api-derive/session/types';
import { DeriveStakingOverview, DeriveStakingWaiting } from '@polkadot/api-derive/staking/types';
import { Card, Progress, Skeleton, Spin } from 'antd';
import BN from 'bn.js';
import { isNull } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from, switchMap, takeWhile, timer } from 'rxjs';
import { MIDDLE_DURATION } from '../../../config';
import { useApi, useIsMounted, useElectedNominators, useStaking } from '../../../hooks';
import { BlockTime } from '../../widget/BlockTime';
import { Statistics } from '../../widget/Statistics';
import { Validators } from './Validators';

interface StatisticProgressProps {
  label: string;
  block?: BN;
  data: { total: number; value: number; active: number } | null;
  className?: string;
}

function StatisticProgress({ label, block, data, className = '' }: StatisticProgressProps) {
  const percent = useMemo(() => {
    if (!data) {
      return 0;
    }

    return parseInt(((data.value / data.total) * 100).toFixed(0), 10);
  }, [data]);

  return (
    <Statistics
      title={label}
      className={className}
      value={
        <div className="grid grid-cols-5 gap-2 items-center">
          <span className="flex-1 col-span-1">
            <BlockTime value={block} />
          </span>
          {isNull(data) ? (
            <Spin />
          ) : data.total > 1 ? (
            <div className="col-span-3 px-2 flex flex-col">
              <span className="inline-flex items-center text-xs text-gray-400">
                <span>{data.value} </span>
                <span className="mx-2">/</span>
                <span>{data.total}</span>
              </span>
              <Progress percent={percent} showInfo={false} className="col-span-2" />
            </div>
          ) : (
            <div>#{data.active}</div>
          )}
        </div>
      }
    />
  );
}

// eslint-disable-next-line complexity
export function StakingOverview() {
  const { t } = useTranslation();
  const { api } = useApi();
  const { stashAccount } = useStaking();
  const [overview, setOverview] = useState<DeriveStakingOverview | null>(null);
  const [waiting, setWaiting] = useState<DeriveStakingWaiting | null>(null);
  const [progress, setProgress] = useState<DeriveSessionProgress | null>(null);
  const { nominators } = useElectedNominators();
  const isMounted = useIsMounted();

  useEffect(() => {
    const sub$$ = from(api.derive.staking.overview())
      .pipe(takeWhile(() => isMounted))
      .subscribe((res) => {
        setOverview(res);
      });

    const waiting$$ = from(api.derive.staking.waitingInfo({ withPrefs: true, withController: true }))
      .pipe(takeWhile(() => isMounted))
      .subscribe((res) => {
        setWaiting(res);
      });

    const progress$$ = timer(0, MIDDLE_DURATION)
      .pipe(
        switchMap((_) => from(api.derive.session.progress())),
        takeWhile(() => isMounted)
      )
      .subscribe((res) => {
        setProgress(res);
      });

    return () => {
      sub$$.unsubscribe();
      waiting$$.unsubscribe();
      progress$$.unsubscribe();
    };
  }, [api, isMounted, stashAccount]);

  return (
    <>
      <Card>
        <div className="grid grid-cols-5">
          <Statistics
            title={t('validators')}
            value={
              overview ? (
                <span>
                  <span>{overview.validators.length}</span>
                  <span className="mx-2">/</span>
                  <span>{overview.validatorCount.toNumber()}</span>
                </span>
              ) : (
                <Spin spinning />
              )
            }
          />
          <Statistics title={t('waiting')} value={waiting ? waiting.info.length : <Spin />} />
          <Statistics title={t('nominators')} value={nominators ? nominators.length : <Spin />} />
          <StatisticProgress
            label={t('epoch')}
            block={progress?.sessionLength}
            data={
              progress && {
                total: progress.sessionLength.toNumber(),
                value: progress.sessionProgress.toNumber(),
                active: progress.currentIndex.toNumber(),
              }
            }
          />
          <StatisticProgress
            label={t('era')}
            className="border-none"
            block={progress?.eraLength}
            data={
              progress && {
                total: progress.eraLength.toNumber(),
                value: progress.eraProgress.toNumber(),
                active: progress.activeEra.toNumber(),
              }
            }
          />
        </div>
      </Card>

      {overview ? (
        <Validators overview={overview} />
      ) : (
        <Card className="my-8">
          <Skeleton active />
        </Card>
      )}
    </>
  );
}
