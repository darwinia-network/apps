import { Card, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import type { Option, Vec, u128 } from '@polkadot/types';
import { Balance, AccountId32 } from '@polkadot/types/interfaces';
import { timer, switchMap, from, forkJoin, tap, EMPTY } from 'rxjs';
import { formatDistanceStrict } from 'date-fns';

import { Statistics } from '../widget/Statistics';
import { LONG_LONG_DURATION, OVERVIEW_STATISTICS, FEE_MARKET_FEE_AND_ORDER_HISTORY } from '../../config';
import { useApi, usePollIntervalQuery } from '../../hooks';
import {
  getFeeMarketModule,
  transformOverviewStatistics,
  transformFeeMarketFeeHistort,
  transformFeeMarketOrderHistort,
} from '../../utils';
import {
  PalletFeeMarketRelayer,
  CrossChainDestination,
  OverviewStatisticsData,
  OverviewStatisticsState,
  FeeMarketFeeAndOderHistoryData,
} from '../../model';
import { TooltipBalance } from '../../components/widget/TooltipBalance';
import { TotalOrdersChart } from './TotalOrdersChart';
import { FeeHistoryChart } from './FeeHistoryChart';

export const Overview = ({
  destination,
  setRefresh,
}: {
  destination: CrossChainDestination;
  setRefresh: (fn: () => void) => void;
}) => {
  const { api, network } = useApi();
  const { t } = useTranslation();

  const [currentFee, setCurrentFee] = useState<{ value?: Balance; loading: boolean }>({ loading: true });
  const [totalRelayers, setTotalRelayers] = useState<{ total: number; active: number; loading: boolean }>({
    total: 0,
    active: 0,
    loading: true,
  });

  const {
    loading: feemarketLoading,
    transformedData: overviewStatisticsState,
    refetch: refetchFeemarket,
  } = usePollIntervalQuery<OverviewStatisticsData, { destination: string }, OverviewStatisticsState>(
    OVERVIEW_STATISTICS,
    {
      variables: { destination },
    },
    transformOverviewStatistics
  );

  const {
    // loading: feeHistoryLoading,
    transformedData: feeHistoryState,
    refetch: refetchFeeHistory,
  } = usePollIntervalQuery<FeeMarketFeeAndOderHistoryData, { destination: string }, [number, number][]>(
    FEE_MARKET_FEE_AND_ORDER_HISTORY,
    {
      variables: { destination },
    },
    transformFeeMarketFeeHistort
  );

  const {
    // loading: orderHistoryLoading,
    transformedData: orderHistoryState,
    refetch: refetchOrderHistory,
  } = usePollIntervalQuery<FeeMarketFeeAndOderHistoryData, { destination: string }, [number, number][]>(
    FEE_MARKET_FEE_AND_ORDER_HISTORY,
    {
      variables: { destination },
    },
    transformFeeMarketOrderHistort
  );

  useEffect(() => {
    setRefresh(() => () => {
      refetchFeemarket();
      refetchFeeHistory();
      refetchOrderHistory();
    });
  }, [setRefresh, refetchFeemarket, refetchFeeHistory, refetchOrderHistory]);

  useEffect(() => {
    const sub$$ = timer(0, LONG_LONG_DURATION)
      .pipe(
        tap(() => setCurrentFee((prev) => ({ ...prev, loading: true }))),
        switchMap(() =>
          from(api.query[getFeeMarketModule(destination)].assignedRelayers<Option<Vec<PalletFeeMarketRelayer>>>())
        )
      )
      .subscribe((res) => {
        if (res.isSome) {
          const lastOne = res.unwrap().pop();
          setCurrentFee({ loading: false, value: lastOne?.fee });
        } else {
          setCurrentFee({ loading: false, value: undefined });
        }
      });

    return () => sub$$.unsubscribe();
  }, [api, destination]);

  useEffect(() => {
    setTotalRelayers((prev) => ({ ...prev, loading: true }));

    const sub$$ = from(api.query[getFeeMarketModule(destination)].relayers<Vec<AccountId32>>())
      .pipe(
        switchMap((total) => {
          return total.length
            ? forkJoin(
                total.map((relayer) =>
                  api.query[getFeeMarketModule(destination)].relayersMap<PalletFeeMarketRelayer>(relayer)
                )
              )
            : EMPTY;
        })
      )
      .subscribe({
        next: (relayers) => {
          let active = 0;
          const collateralPerOrder = api.consts[getFeeMarketModule(destination)].collateralPerOrder as u128;

          relayers.forEach((relayer) => {
            if (relayer.collateral.gte(collateralPerOrder)) {
              // https://github.com/darwinia-network/apps/issues/314
              active++;
            }
          });

          setTotalRelayers({
            active,
            total: relayers.length,
            loading: false,
          });
        },
        complete: () => setTotalRelayers((prev) => ({ ...prev, loading: false })),
        error: () => setTotalRelayers((prev) => ({ ...prev, loading: false })),
      });

    return () => sub$$.unsubscribe();
  }, [api, destination]);

  return (
    <>
      <Card className="shadow-xxl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-0 lg:justify-items-center">
          <Statistics
            className="lg:border-r lg:justify-center"
            title={t('Total Relayers')}
            value={
              <Spin size="small" spinning={totalRelayers.loading}>
                <span>{`${totalRelayers.active} / ${totalRelayers.total}`}</span>
              </Spin>
            }
          />
          <Statistics
            className="lg:border-r lg:justify-center"
            title={t('Average Speed')}
            value={
              <Spin size="small" spinning={feemarketLoading}>
                <span className="capitalize">
                  {formatDistanceStrict(
                    new Date(),
                    new Date(Date.now() + (overviewStatisticsState?.averageSpeed || 0))
                  )}
                </span>
              </Spin>
            }
          />
          <Statistics
            className="lg:border-r lg:justify-center"
            title={t('Current Message Fee')}
            value={
              <Spin size="small" spinning={currentFee.loading}>
                <TooltipBalance value={currentFee.value} precision={Number(network.tokens.ring.decimal)} />
                <span> {network.tokens.ring.symbol}</span>
              </Spin>
            }
          />
          <Statistics
            className="lg:border-r lg:justify-center"
            title={t('Total Rewards')}
            value={
              <Spin size="small" spinning={feemarketLoading}>
                <TooltipBalance
                  value={overviewStatisticsState?.totalRewards}
                  precision={Number(network.tokens.ring.decimal)}
                />
                <span> {network.tokens.ring.symbol}</span>
              </Spin>
            }
          />
          <Statistics
            className="lg:justify-center"
            title={t('Total Orders')}
            value={
              <Spin size="small" spinning={feemarketLoading}>
                <span>{overviewStatisticsState?.totalOrders || 0}</span>
              </Spin>
            }
          />
        </div>
      </Card>
      <div className="flex justify-between items-center space-x-4 mt-8">
        <TotalOrdersChart data={orderHistoryState || []} />
        <FeeHistoryChart data={feeHistoryState || []} />
      </div>
    </>
  );
};
