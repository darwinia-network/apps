import { Card, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useRef, useEffect, useState } from 'react';
import * as echarts from 'echarts/core';
import { GridComponent, GridComponentOption } from 'echarts/components';
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
import { LONG_DURATION, QUERY_FEEMARKET_RECORD, QUERY_INPROGRESS_ORDERS } from '../../config';
import { useApi, useFeeMarket } from '../../hooks';
import { getFeeMarketModule, prettyNumber, fromWei } from '../../utils';
import { PalletFeeMarketRelayer } from '../../model';
import { PrettyAmount } from '../../components/widget/PrettyAmount';

echarts.use([GridComponent, BarChart, LineChart, SVGRenderer, UniversalTransition]);

type EChartsOption = echarts.ComposeOption<GridComponentOption | BarSeriesOption | LineSeriesOption>;

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
  const { data: inProgressOrderEntitiesData } = useQuery(QUERY_INPROGRESS_ORDERS, {
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
        }
      });

    return () => sub$$.unsubscribe();
  }, [api, destination]);

  useEffect(() => {
    setTotalRelayers((prev) => ({ ...prev, loading: true }));
    const inProgressOrdersRelayers: Record<string, number> = {};

    inProgressOrderEntitiesData?.orderEntities.nodes.forEach(({ assignedRelayers }: { assignedRelayers: string[] }) => {
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
  }, [inProgressOrderEntitiesData, api, destination]);

  useEffect(() => {
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

      echarts.init(totalOrdersRef.current).setOption(option);
    }
  }, []);

  useEffect(() => {
    if (feeHistoryRef.current) {
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
            data: [820, 932, 901, 934, 1290, 1330, 1320],
            type: 'line',
            smooth: true,
          },
        ],
      };

      echarts.init(feeHistoryRef.current).setOption(option);
    }
  }, []);

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
