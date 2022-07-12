import { Card, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useEffect, useState, createRef } from 'react';
import type { Option, Vec, u128 } from '@polkadot/types';
import { BN_ONE } from '@polkadot/util';
import { Balance, AccountId32 } from '@polkadot/types/interfaces';
import { timer, switchMap, from, forkJoin, tap, EMPTY } from 'rxjs';
import { useQuery } from '@apollo/client';
import { formatDistanceStrict } from 'date-fns';

import * as echarts from 'echarts/core';
import { GridComponent, GridComponentOption, TooltipComponent, TooltipComponentOption } from 'echarts/components';
import { BarChart, BarSeriesOption } from 'echarts/charts';
import { LineChart, LineSeriesOption } from 'echarts/charts';
import { SVGRenderer } from 'echarts/renderers';
import { UniversalTransition } from 'echarts/features';

import { Statistics } from '../widget/Statistics';
import {
  LONG_LONG_DURATION,
  QUERY_FEEMARKET_RECORD,
  IN_PROGRESS_ORDERS_ASSIGNED_RELAYERS,
  TOTAL_ORDERS_AND_FEE_HISTORY,
} from '../../config';
import { useApi } from '../../hooks';
import { getFeeMarketModule, prettyNumber, fromWei, getSegmentedDateByType } from '../../utils';
import {
  PalletFeeMarketRelayer,
  SegmentedType,
  ChartState,
  CrossChainDestination,
  InProgressOrdersAssignedRelayers,
  TotalOrdersAndFeeHistory,
} from '../../model';
import { PrettyAmount } from '../../components/widget/PrettyAmount';
import { Segmented } from '../widget/fee-market';

echarts.use([GridComponent, TooltipComponent, BarChart, LineChart, SVGRenderer, UniversalTransition]);

type EChartsOption = echarts.ComposeOption<
  GridComponentOption | BarSeriesOption | LineSeriesOption | TooltipComponentOption
>;

export const Overview = ({ destination }: { destination: CrossChainDestination }) => {
  const { api, network } = useApi();
  const { t } = useTranslation();

  const totalOrdersRef = createRef<HTMLDivElement>();
  const feeHistoryRef = createRef<HTMLDivElement>();

  const [feeSgmentedType, setFeeSegmentedType] = useState(SegmentedType.ALL);
  const [orderSegmentedType, setOrderSegmentedType] = useState(SegmentedType.ALL);

  const [feeHistory, setFeeHistory] = useState<ChartState>({ dates: [], data: [] });
  const [totalOrders, setTotalOrders] = useState<ChartState>({ dates: [], data: [] });
  const [currentFee, setCurrentFee] = useState<{ value?: Balance; loading: boolean }>({ loading: true });
  const [totalRelayers, setTotalRelayers] = useState<{ total: number; inactive: number; loading: boolean }>({
    total: 0,
    inactive: 0,
    loading: true,
  });

  const { loading: feemarketLoading, data: feeMarketData } = useQuery(QUERY_FEEMARKET_RECORD, {
    variables: { destination },
    pollInterval: LONG_LONG_DURATION,
    notifyOnNetworkStatusChange: true,
  });
  const { data: inProgressOrders } = useQuery(IN_PROGRESS_ORDERS_ASSIGNED_RELAYERS, {
    variables: { destination },
    pollInterval: LONG_LONG_DURATION,
  }) as {
    data: InProgressOrdersAssignedRelayers | null;
  };
  const { data: feeHistoryData, loading: feeHistoryLoading } = useQuery(TOTAL_ORDERS_AND_FEE_HISTORY, {
    variables: { destination, date: getSegmentedDateByType(feeSgmentedType) },
    pollInterval: LONG_LONG_DURATION,
  }) as { data: TotalOrdersAndFeeHistory | null; loading: boolean };
  const { data: totalOrdersData, loading: totalOrdersLoading } = useQuery(TOTAL_ORDERS_AND_FEE_HISTORY, {
    variables: { destination, date: getSegmentedDateByType(orderSegmentedType) },
    pollInterval: LONG_LONG_DURATION,
  }) as { data: TotalOrdersAndFeeHistory | null; loading: boolean };

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
          const last = res.unwrap().pop();
          setCurrentFee({ loading: false, value: last?.fee });
        } else {
          setCurrentFee({ loading: false, value: undefined });
        }
      });

    return () => sub$$.unsubscribe();
  }, [api, destination]);

  useEffect(() => {
    setTotalRelayers((prev) => ({ ...prev, loading: true }));

    const relayersInprogressOrders =
      inProgressOrders?.orderEntities?.nodes.reduce((acc, cur) => {
        cur.assignedRelayers.forEach((r) => {
          acc[r] = acc[r] ? acc[r] + 1 : 1;
        });

        return acc;
      }, {} as Record<string, number>) || {};

    const sub$$ = from(api.query[getFeeMarketModule(destination)].relayers<Vec<AccountId32>>())
      .pipe(
        tap((total) => setTotalRelayers((prev) => ({ ...prev, total: total.length }))),
        switchMap((total) => {
          const relayers = Object.keys(relayersInprogressOrders).filter((relayer) =>
            total.map((account) => account.toString()).includes(relayer)
          );

          return relayers.length
            ? forkJoin(
                relayers.map((relayer) =>
                  api.query[getFeeMarketModule(destination)].relayersMap<PalletFeeMarketRelayer>(relayer)
                )
              )
            : EMPTY;
        })
      )
      .subscribe({
        next: (res) => {
          let inactive = 0;
          const collateralPerOrder = api.consts[getFeeMarketModule(destination)].collateralPerOrder as u128;

          res.forEach((relayer) => {
            if (
              relayer.collateral
                .div(collateralPerOrder.muln(relayersInprogressOrders[relayer.id.toString()]))
                .lt(BN_ONE)
            ) {
              // https://github.com/darwinia-network/apps/issues/165
              inactive++;
            }
          });

          setTotalRelayers((prev) => ({ ...prev, inactive, loading: false }));
        },
        complete: () => setTotalRelayers((prev) => ({ ...prev, inactive: 0, loading: false })),
        error: () => setTotalRelayers((prev) => ({ ...prev, inactive: prev.total, loading: false })),
      });

    return () => sub$$.unsubscribe();
  }, [inProgressOrders, api, destination]);

  useEffect(() => {
    const { dates, data } = feeHistoryData?.orderEntities?.nodes.reduce(
      ({ dates, data }, { fee, createTime }) => {
        dates.push(createTime.split('.')[0].replace(/-/g, '/'));
        data.push(fromWei({ value: fee }, prettyNumber));

        return { dates, data };
      },
      { dates: [], data: [] } as ChartState
    ) || { dates: [], data: [] };

    setFeeHistory({ dates, data });
  }, [feeHistoryData?.orderEntities?.nodes]);

  useEffect(() => {
    const daysCount =
      totalOrdersData?.orderEntities?.nodes.reduce((acc, { createTime }) => {
        const day = createTime.split('T')[0];
        acc[day] = acc[day] ? acc[day] + 1 : 1;
        return acc;
      }, {} as Record<string, number>) || {};

    const { dates, data } = Object.keys(daysCount).reduce(
      ({ dates, data }, day) => {
        dates.push(day.replace(/-/g, '/'));
        data.push(daysCount[day].toString());

        return { dates, data };
      },
      { dates: [], data: [] } as ChartState
    ) || { dates: [], data: [] };

    setTotalOrders({ dates, data });
  }, [totalOrdersData?.orderEntities?.nodes]);

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
        data: totalOrders.dates,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: totalOrders.data,
          type: 'bar',
        },
      ],
    };

    const instance = echarts.init(totalOrdersRef.current);
    instance.setOption(option);

    return () => instance.dispose();
  }, [totalOrders, totalOrdersRef]);

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
        data: feeHistory.dates,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: feeHistory.data,
          type: 'line',
          smooth: true,
        },
      ],
    };

    const instance = echarts.init(feeHistoryRef.current);
    instance.setOption(option);

    return () => instance.dispose();
  }, [feeHistory, feeHistoryRef]);

  return (
    <>
      <Card className="shadow-xxl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-0 lg:justify-items-center">
          <Statistics
            className="lg:border-r lg:justify-center"
            title={t('Total Relayers')}
            value={
              <Spin size="small" spinning={totalRelayers.loading}>
                <span>{`${totalRelayers.total - totalRelayers.inactive} / ${totalRelayers.total}`}</span>
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
                    new Date(Date.now() + (feeMarketData?.feeMarketEntity?.averageSpeed || 0))
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
                <PrettyAmount amount={fromWei({ value: currentFee.value }, prettyNumber)} />
                <span> {network.tokens.ring.symbol}</span>
              </Spin>
            }
          />
          <Statistics
            className="lg:border-r lg:justify-center"
            title={t('Total Rewards')}
            value={
              <Spin size="small" spinning={feemarketLoading}>
                <PrettyAmount amount={fromWei({ value: feeMarketData?.feeMarketEntity?.totalRewards }, prettyNumber)} />
                <span> {network.tokens.ring.symbol}</span>
              </Spin>
            }
          />
          <Statistics
            className="lg:justify-center"
            title={t('Total Orders')}
            value={
              <Spin size="small" spinning={feemarketLoading}>
                <span>{feeMarketData?.feeMarketEntity?.totalOrders || 0}</span>
              </Spin>
            }
          />
        </div>
      </Card>
      <div className="flex items-center justify-between mt-8">
        <Card className="shadow-xxl" style={{ width: '49.5%' }}>
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-base text-black opacity-80">{t('Total Orders')}</h3>
            <Segmented onSelect={setOrderSegmentedType} value={orderSegmentedType} />
          </div>
          <Spin spinning={totalOrdersLoading}>
            <div ref={totalOrdersRef} className="h-96 w-11/12" />
          </Spin>
        </Card>
        <Card className="shadow-xxl" style={{ width: '49.5%' }}>
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-base text-black opacity-80">{t('Fee History')}</h3>
            <Segmented onSelect={setFeeSegmentedType} value={feeSgmentedType} />
          </div>
          <Spin spinning={feeHistoryLoading}>
            <div ref={feeHistoryRef} className="h-96 w-11/12" />
          </Spin>
        </Card>
      </div>
    </>
  );
};
