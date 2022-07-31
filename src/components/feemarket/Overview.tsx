import { Card, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useEffect, useState, createRef } from 'react';
import type { Option, Vec, u128 } from '@polkadot/types';
import { Balance, AccountId32 } from '@polkadot/types/interfaces';
import { timer, switchMap, from, forkJoin, tap, EMPTY } from 'rxjs';
import { formatDistanceStrict } from 'date-fns';

import * as echarts from 'echarts/core';
import { GridComponent, GridComponentOption, TooltipComponent, TooltipComponentOption } from 'echarts/components';
import { BarChart, BarSeriesOption } from 'echarts/charts';
import { LineChart, LineSeriesOption } from 'echarts/charts';
import { SVGRenderer } from 'echarts/renderers';
import { UniversalTransition } from 'echarts/features';

import { Statistics } from '../widget/Statistics';
import { LONG_LONG_DURATION, OVERVIEW_STATISTICS, FEE_MARKET_FEE_AND_ORDER_HISTORY } from '../../config';
import { useApi, usePollIntervalQuery } from '../../hooks';
import {
  getFeeMarketModule,
  getSegmentedDateByType,
  transformOverviewStatistics,
  transformFeeMarketFeeHistort,
  transformFeeMarketOrderHistort,
} from '../../utils';
import {
  PalletFeeMarketRelayer,
  SegmentedType,
  CrossChainDestination,
  OverviewStatisticsData,
  OverviewStatisticsState,
  FeeMarketFeeAndOderHistoryData,
  FeeMarketFeeAndOrderHistortState,
} from '../../model';
import { TooltipBalance } from '../../components/widget/TooltipBalance';
import { Segmented } from '../widget/fee-market';

echarts.use([GridComponent, TooltipComponent, BarChart, LineChart, SVGRenderer, UniversalTransition]);

type EChartsOption = echarts.ComposeOption<
  GridComponentOption | BarSeriesOption | LineSeriesOption | TooltipComponentOption
>;

export const Overview = ({
  destination,
  setRefresh,
}: {
  destination: CrossChainDestination;
  setRefresh: (fn: () => void) => void;
}) => {
  const { api, network } = useApi();
  const { t } = useTranslation();

  const totalOrdersRef = createRef<HTMLDivElement>();
  const feeHistoryRef = createRef<HTMLDivElement>();

  const [feeSgmentedType, setFeeSegmentedType] = useState(SegmentedType.ALL);
  const [orderSegmentedType, setOrderSegmentedType] = useState(SegmentedType.ALL);

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
    loading: feeHistoryLoading,
    transformedData: feeHistoryState,
    refetch: refetchFeeHistory,
  } = usePollIntervalQuery<
    FeeMarketFeeAndOderHistoryData,
    { destination: string; time: string },
    FeeMarketFeeAndOrderHistortState
  >(
    FEE_MARKET_FEE_AND_ORDER_HISTORY,
    {
      variables: { destination, time: getSegmentedDateByType(feeSgmentedType) },
    },
    transformFeeMarketFeeHistort
  );

  const {
    loading: orderHistoryLoading,
    transformedData: orderHistoryState,
    refetch: refetchOrderHistory,
  } = usePollIntervalQuery<
    FeeMarketFeeAndOderHistoryData,
    { destination: string; time: string },
    FeeMarketFeeAndOrderHistortState
  >(
    FEE_MARKET_FEE_AND_ORDER_HISTORY,
    {
      variables: { destination, time: getSegmentedDateByType(orderSegmentedType) },
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

  useEffect(() => {
    if (!totalOrdersRef.current || totalOrdersRef.current.clientHeight === 0) {
      return;
    }

    const option: EChartsOption = {
      tooltip: {
        trigger: 'axis',
        position: (pt) => [pt[0], '10%'],
      },
      xAxis: {
        type: 'category',
        data: orderHistoryState?.dates,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: orderHistoryState?.values,
          type: 'bar',
        },
      ],
    };

    const instance = echarts.init(totalOrdersRef.current);
    instance.setOption(option);

    return () => instance.dispose();
  }, [orderHistoryState, totalOrdersRef]);

  useEffect(() => {
    if (!feeHistoryRef.current || feeHistoryRef.current.clientHeight === 0) {
      return;
    }

    const option: EChartsOption = {
      tooltip: {
        trigger: 'axis',
        position: (pt) => [pt[0], '10%'],
      },
      xAxis: {
        type: 'category',
        data: feeHistoryState?.dates,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: feeHistoryState?.values,
          type: 'line',
          smooth: true,
        },
      ],
    };

    const instance = echarts.init(feeHistoryRef.current);
    instance.setOption(option);

    return () => instance.dispose();
  }, [feeHistoryState, feeHistoryRef]);

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
                <span>
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
      <div className="flex items-center justify-between space-x-4 mt-8">
        <Card className="shadow-xxl flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-base text-black opacity-80">{t('Total Orders')}</h3>
            <Segmented onSelect={setOrderSegmentedType} value={orderSegmentedType} />
          </div>
          <Spin spinning={orderHistoryLoading}>
            <div ref={totalOrdersRef} className="h-96 w-full" />
          </Spin>
        </Card>
        <Card className="shadow-xxl flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-base text-black opacity-80">{t('Fee History')}</h3>
            <Segmented onSelect={setFeeSegmentedType} value={feeSgmentedType} />
          </div>
          <Spin spinning={feeHistoryLoading}>
            <div ref={feeHistoryRef} className="h-96 w-full" />
          </Spin>
        </Card>
      </div>
    </>
  );
};
