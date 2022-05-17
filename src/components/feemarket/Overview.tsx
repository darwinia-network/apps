import { Card } from 'antd';
import { useTranslation } from 'react-i18next';
import { useRef, useEffect } from 'react';
import * as echarts from 'echarts/core';
import { GridComponent, GridComponentOption } from 'echarts/components';
import { BarChart, BarSeriesOption } from 'echarts/charts';
import { LineChart, LineSeriesOption } from 'echarts/charts';
import { SVGRenderer } from 'echarts/renderers';
import { UniversalTransition } from 'echarts/features';
import { Statistics } from '../widget/Statistics';

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
  const { t } = useTranslation();
  const totalOrdersRef = useRef<HTMLDivElement>(null);
  const feeHistoryRef = useRef<HTMLDivElement>(null);

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
          <Statistics className="lg:border-r lg:justify-center" title={t('Current Message Fee')} value={'25 RING'} />
          <Statistics className="lg:border-r lg:justify-center" title={t('Total Rewards')} value={1000} />
          <Statistics className="lg:justify-center" title={t('Total Orders')} value={99988} />
        </div>
      </Card>
      <div className="flex items-center justify-between space-x-2 mt-8">
        <Card className="w-2/4 shadow-xxl">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-base text-black opacity-80">Total orders</h3>
            <Segmented />
          </div>
          <div ref={totalOrdersRef} className="h-96" />
        </Card>
        <Card className="w-2/4 shadow-xxl">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-base text-black opacity-80">Fee History</h3>
            <Segmented />
          </div>
          <div ref={feeHistoryRef} className="h-96" />
        </Card>
      </div>
    </>
  );
};
