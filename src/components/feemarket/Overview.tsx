import { Card, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useRef, useEffect, useState } from 'react';
import * as echarts from 'echarts/core';
import { GridComponent, GridComponentOption } from 'echarts/components';
import { BarChart, BarSeriesOption } from 'echarts/charts';
import { LineChart, LineSeriesOption } from 'echarts/charts';
import { SVGRenderer } from 'echarts/renderers';
import { UniversalTransition } from 'echarts/features';
import { Option, Vec } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import { timer, switchMap, from, tap } from 'rxjs';
import { Statistics } from '../widget/Statistics';
import { LONG_DURATION } from '../../config';
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
  const { t } = useTranslation();
  const totalOrdersRef = useRef<HTMLDivElement>(null);
  const feeHistoryRef = useRef<HTMLDivElement>(null);
  const [currentFee, setCurrentFee] = useState<{ value?: Balance; loading: boolean }>({ loading: true });

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
          <Statistics className="lg:border-r lg:justify-center" title={t('Total Relayers')} value={'99 / 105'} />
          <Statistics className="lg:border-r lg:justify-center" title={t('Average Speed')} value={'13s'} />
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
          <Statistics className="lg:border-r lg:justify-center" title={t('Total Rewards')} value={1000} />
          <Statistics className="lg:justify-center" title={t('Total Orders')} value={99988} />
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
