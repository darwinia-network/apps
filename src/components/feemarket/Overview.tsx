import { Card, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useRef, useEffect, useState } from 'react';
import * as echarts from 'echarts/core';
import { GridComponent, GridComponentOption, TooltipComponent, TooltipComponentOption } from 'echarts/components';
import { BarChart, BarSeriesOption } from 'echarts/charts';
import { LineChart, LineSeriesOption } from 'echarts/charts';
import { SVGRenderer } from 'echarts/renderers';
import { UniversalTransition } from 'echarts/features';
import type { Option, Vec, u128 } from '@polkadot/types';
import { BN_ONE } from '@polkadot/util';
import { Balance, AccountId32 } from '@polkadot/types/interfaces';
import { timer, switchMap, from, forkJoin, tap, EMPTY } from 'rxjs';
import { useQuery } from '@apollo/client';
import { formatDistanceStrict } from 'date-fns';
import { Statistics } from '../widget/Statistics';
import {
  LONG_DURATION,
  QUERY_FEEMARKET_RECORD,
  QUERY_INPROGRESS_ORDERS,
  QUERY_ORDERS_FOR_OVERVIEW_CHART,
} from '../../config';
import { useApi, useFeeMarket } from '../../hooks';
import { getFeeMarketModule, prettyNumber, fromWei } from '../../utils';
import { PalletFeeMarketRelayer } from '../../model';
import { PrettyAmount } from '../../components/widget/PrettyAmount';

echarts.use([GridComponent, TooltipComponent, BarChart, LineChart, SVGRenderer, UniversalTransition]);

type EChartsOption = echarts.ComposeOption<
  GridComponentOption | BarSeriesOption | LineSeriesOption | TooltipComponentOption
>;

const Segmented = () => (
  <div className="inline-flex items-center justify-center space-x-1">
    <span className="cursor-pointer bg-gray-300 px-2 rounded-l-sm">All</span>
    <span className="cursor-pointer bg-gray-300 px-2">7D</span>
    <span className="cursor-pointer bg-gray-300 px-2 rounded-r-sm">30D</span>
  </div>
);

export const Overview = () => {
  const { api, network } = useApi();
  const { destination } = useFeeMarket();
  const { loading: feemarketEntityLoading, data: feeMarketEntityData } = useQuery(QUERY_FEEMARKET_RECORD, {
    variables: { destination },
    pollInterval: LONG_DURATION,
    notifyOnNetworkStatusChange: true,
  });
  const { data: inProgressOrdersData } = useQuery(QUERY_INPROGRESS_ORDERS, {
    variables: { destination },
    pollInterval: LONG_DURATION,
  });
  const { data: forChartOrdersData } = useQuery(QUERY_ORDERS_FOR_OVERVIEW_CHART, {
    variables: { destination },
    pollInterval: LONG_DURATION,
  });
  const { t } = useTranslation();
  const totalOrdersRef = useRef<HTMLDivElement>(null);
  const feeHistoryRef = useRef<HTMLDivElement>(null);
  const [currentFee, setCurrentFee] = useState<{ value?: Balance; loading: boolean }>({ loading: true });
  const [totalRelayers, setTotalRelayers] = useState<{ total: number; inactive: number; loading: boolean }>({
    total: 0,
    inactive: 0,
    loading: true,
  });

  useEffect(() => {
    const sub$$ = timer(0, LONG_DURATION)
      .pipe(
        tap(() => setCurrentFee((prev) => ({ ...prev, loading: true }))),
        switchMap(() =>
          from(api.query[getFeeMarketModule(destination)].assignedRelayers<Option<Vec<PalletFeeMarketRelayer>>>())
        )
      )
      .subscribe((res) => {
        if (res.isSome) {
          const lastRelayers = res.unwrap().pop();
          if (lastRelayers) {
            setCurrentFee({ loading: false, value: lastRelayers.fee });
          }
        } else {
          setCurrentFee({ loading: false, value: undefined });
        }
      });

    return () => sub$$.unsubscribe();
  }, [api, destination]);

  useEffect(() => {
    setTotalRelayers((prev) => ({ ...prev, loading: true }));
    const inProgressOrdersRelayers: Record<string, number> = {};

    inProgressOrdersData?.orderEntities.nodes.forEach(({ assignedRelayers }: { assignedRelayers: string[] }) => {
      assignedRelayers.forEach((relayer) => {
        inProgressOrdersRelayers[relayer] = inProgressOrdersRelayers[relayer]
          ? inProgressOrdersRelayers[relayer] + 1
          : 1;
      });
    });

    const sub$$ = from(api.query[getFeeMarketModule(destination)].relayers<Vec<AccountId32>>())
      .pipe(
        tap((total) => setTotalRelayers((prev) => ({ ...prev, total: total.length }))),
        switchMap((total) => {
          const relayers = Object.keys(inProgressOrdersRelayers).filter((relayer) =>
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
                .div(collateralPerOrder.muln(inProgressOrdersRelayers[relayer.id.toString()]))
                .lt(BN_ONE)
            ) {
              inactive++;
            }
          });

          setTotalRelayers((prev) => ({ ...prev, inactive, loading: false }));
        },
        complete: () => setTotalRelayers((prev) => ({ ...prev, inactive: 0, loading: false })),
        error: () => setTotalRelayers((prev) => ({ ...prev, inactive: prev.total, loading: false })),
      });

    return () => sub$$.unsubscribe();
  }, [inProgressOrdersData, api, destination]);

  useEffect(() => {
    let instance: echarts.ECharts;

    if (totalOrdersRef.current) {
      const option: EChartsOption = {
        xAxis: {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            // eslint-disable-next-line no-magic-numbers
            data: [120, 200, 150, 80, 70, 110, 130],
            type: 'bar',
          },
        ],
      };

      instance = echarts.init(totalOrdersRef.current);
      instance.setOption(option);
    }

    return () => {
      if (instance) {
        instance.dispose();
      }
    };
  }, []);

  useEffect(() => {
    let instance: echarts.ECharts;

    if (feeHistoryRef.current) {
      const date =
        forChartOrdersData?.orderEntities.nodes.map((node: { createTime: string }) =>
          node.createTime.split('.')[0].replace(/-/g, '/')
        ) || [];
      const data =
        forChartOrdersData?.orderEntities.nodes.map((node: { fee: string }) =>
          fromWei({ value: node.fee }, prettyNumber)
        ) || [];

      const option: EChartsOption = {
        tooltip: {
          trigger: 'axis',
          position: (pt) => [pt[0], '10%'],
        },
        xAxis: {
          type: 'category',
          data: date,
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            data,
            type: 'line',
            smooth: true,
          },
        ],
      };

      instance = echarts.init(feeHistoryRef.current);
      instance.setOption(option);
    }

    return () => {
      if (instance) {
        instance.dispose();
      }
    };
  }, [forChartOrdersData]);

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
              <Spin size="small" spinning={feemarketEntityLoading}>
                <span>
                  {formatDistanceStrict(
                    new Date(),
                    new Date(Date.now() + (feeMarketEntityData?.feeMarketEntity?.averageSpeed || 0))
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
              <Spin size="small" spinning={feemarketEntityLoading}>
                <PrettyAmount
                  amount={fromWei({ value: feeMarketEntityData?.feeMarketEntity?.totalRewards }, prettyNumber)}
                />
                <span> {network.tokens.ring.symbol}</span>
              </Spin>
            }
          />
          <Statistics
            className="lg:justify-center"
            title={t('Total Orders')}
            value={
              <Spin size="small" spinning={feemarketEntityLoading}>
                <span>{feeMarketEntityData?.feeMarketEntity?.totalOrders || 0}</span>
              </Spin>
            }
          />
        </div>
      </Card>
      <div className="flex items-center justify-between mt-8">
        <Card className="shadow-xxl" style={{ width: '49.5%' }}>
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-base text-black opacity-80">Total orders</h3>
            <Segmented />
          </div>
          <div ref={totalOrdersRef} className="h-96 w-11/12" />
        </Card>
        <Card className="shadow-xxl" style={{ width: '49.5%' }}>
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-base text-black opacity-80">Fee History</h3>
            <Segmented />
          </div>
          <div ref={feeHistoryRef} className="h-96 w-11/12" />
        </Card>
      </div>
    </>
  );
};
