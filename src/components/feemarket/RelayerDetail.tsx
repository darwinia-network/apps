import { Card, Breadcrumb, Table } from 'antd';
import { NavLink } from 'react-router-dom';
import { ColumnsType } from 'antd/lib/table';
import { useRef, useEffect } from 'react';

import * as echarts from 'echarts/core';
import {
  TitleComponent,
  TitleComponentOption,
  ToolboxComponent,
  ToolboxComponentOption,
  TooltipComponent,
  TooltipComponentOption,
  GridComponent,
  GridComponentOption,
  LegendComponent,
  LegendComponentOption,
} from 'echarts/components';
import { BarChart, BarSeriesOption, LineChart, LineSeriesOption } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { Path } from '../../config/routes';

echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  LineChart,
  CanvasRenderer,
  UniversalTransition,
]);

type EChartsOption = echarts.ComposeOption<
  | TitleComponentOption
  | ToolboxComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | LegendComponentOption
  | BarSeriesOption
  | LineSeriesOption
>;

type RelayerData = {
  key: number;
  orderId: string;
  deliveryRelayer: string;
  confirmationRelayer: string;
  slotAssignedRelayer: string;
  startBlock: number;
  confirmBlock: number;
  time: string;
};

const columns: ColumnsType<RelayerData> = [
  {
    title: 'Order ID',
    key: 'orderId',
    dataIndex: 'orderId',
    align: 'center',
  },
  {
    title: 'Delivery Relayer',
    key: 'deliveryRelayer',
    dataIndex: 'deliveryRelayer',
    align: 'center',
  },
  {
    title: 'Confirmation Relayer',
    key: 'confirmationRelayer',
    dataIndex: 'confirmationRelayer',
    align: 'center',
  },
  {
    title: 'Slot Assigned Relayer',
    key: 'slotAssignedRelayer',
    dataIndex: 'slotAssignedRelayer',
    align: 'center',
  },
  {
    title: 'Start Block',
    key: 'startBlock',
    dataIndex: 'startBlock',
    align: 'center',
  },
  {
    title: 'Confirm Block',
    key: 'confirmBlock',
    dataIndex: 'confirmBlock',
    align: 'center',
  },
  {
    title: 'Time',
    key: 'time',
    dataIndex: 'time',
    align: 'center',
  },
];

const dataSource = [
  {
    key: 1,
    orderId: '0x87654',
    deliveryRelayer: '3444444',
    confirmationRelayer: 'swswswsws',
    slotAssignedRelayer: 'frfrfrfrfrfr',
    startBlock: 123,
    confirmBlock: 234,
    time: '2022/5/23',
  },
];

const Segmented = () => (
  <div className="absolute top-3 left-auto right-0 inline-flex items-center justify-center space-x-1">
    <span className="cursor-pointer bg-gray-300 px-2 rounded-l-sm">All</span>
    <span className="cursor-pointer bg-gray-300 px-2">7D</span>
    <span className="cursor-pointer bg-gray-300 px-2 rounded-r-sm">30D</span>
  </div>
);

export const RelayerDetail = () => {
  const inOutHistoryRef = useRef<HTMLDivElement>(null);
  const quoteHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chart = inOutHistoryRef.current ? echarts.init(inOutHistoryRef.current) : null;

    if (chart) {
      const option: EChartsOption = {
        title: {
          text: 'Reward & Slash',
          left: 0,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999',
            },
          },
        },
        legend: {
          data: ['Evaporation', 'Precipitation', 'Temperature'],
          bottom: 0,
        },
        xAxis: [
          {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            axisPointer: {
              type: 'shadow',
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            name: 'Unit: RING',
            min: 0,
            max: 250,
            interval: 50,
          },
          {
            type: 'value',
            name: 'Temperature',
            min: 0,
            max: 25,
            interval: 5,
            nameTextStyle: {
              fontSize: 0,
            },
          },
        ],
        series: [
          {
            name: 'Evaporation',
            type: 'bar',
            tooltip: {
              valueFormatter(value) {
                return value + ' ml';
              },
            },
            // eslint-disable-next-line no-magic-numbers
            data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3],
          },
          {
            name: 'Precipitation',
            type: 'bar',
            tooltip: {
              valueFormatter(value) {
                return value + ' ml';
              },
            },
            // eslint-disable-next-line no-magic-numbers
            data: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3],
          },
          {
            name: 'Temperature',
            type: 'line',
            yAxisIndex: 1,
            tooltip: {
              valueFormatter(value) {
                return value + ' °C';
              },
            },
            // eslint-disable-next-line no-magic-numbers
            data: [2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 12.0, 6.2],
          },
        ],
      };

      chart.setOption(option);
    }

    return () => {
      if (chart) {
        chart.dispose();
      }
    };
  }, []);

  useEffect(() => {
    const chart = quoteHistoryRef.current ? echarts.init(quoteHistoryRef.current) : null;

    if (chart) {
      const option: EChartsOption = {
        title: {
          text: 'Uqote History',
          left: 0,
        },
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
            data: [150, 230, 224, 218, 135, 147, 260],
            type: 'line',
          },
        ],
      };

      chart.setOption(option);
    }

    return () => {
      if (chart) {
        chart.dispose();
      }
    };
  }, []);

  return (
    <>
      <Breadcrumb separator=">">
        <Breadcrumb.Item>
          <NavLink to={`${Path.feemarket}?tab=relayers`}>Relayers</NavLink>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{` 0x0a11…ed1a80`}</Breadcrumb.Item>
      </Breadcrumb>

      <Card className="mt-1">
        <div className="flex items-center justify-between">
          <div className="relative" style={{ width: '49%' }}>
            <Segmented />
            <div ref={inOutHistoryRef} className="h-96 w-full" />
          </div>
          <div className="relative" style={{ width: '49%' }}>
            <Segmented />
            <div ref={quoteHistoryRef} className="h-96 w-full" />
          </div>
        </div>
      </Card>
      <Card className="mt-4">
        <Table columns={columns} dataSource={dataSource} />
      </Card>
    </>
  );
};
