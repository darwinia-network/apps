import { Card, Statistic, Table, Select, Input, Button, Form, DatePicker, Badge, InputNumber, Spin } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { formatDistanceStrict } from 'date-fns';

import * as echarts from 'echarts/core';
import { TooltipComponent, TooltipComponentOption, LegendComponent, LegendComponentOption } from 'echarts/components';
import { PieChart, PieSeriesOption } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

import { ORDERS_STATISTICS, ORDERS_TOTAL_ORDERS, LONG_LONG_DURATION } from '../../config';
import { useFeeMarket, useApi } from '../../hooks';
import { OrdersStatisticsData, OrdersTotalOrderData } from '../../model';
import { IdentAccountName } from '../widget/account/IdentAccountName';
import { SubscanLink } from '../widget/SubscanLink';

echarts.use([TooltipComponent, LegendComponent, PieChart, CanvasRenderer, LabelLayout]);

type EChartsOption = echarts.ComposeOption<TooltipComponentOption | LegendComponentOption | PieSeriesOption>;

type OrderData = {
  orderId: string;
  deliveryRelayer?: string;
  confirmationRelayer?: string;
  assignedRelayer?: string;
  startBlock: number;
  confirmBlock?: number;
  time?: string;
};

export const Orders = () => {
  const { network } = useApi();
  const { destination } = useFeeMarket();
  const ref = useRef<HTMLDivElement>(null);
  const [timeDimension, setTimeDimension] = useState(1);
  const [dataSource, setDataSource] = useState<OrderData[]>([]);
  const { loading: statisticsLoading, data: statisticsData } = useQuery(ORDERS_STATISTICS, {
    variables: { destination },
    pollInterval: LONG_LONG_DURATION,
    notifyOnNetworkStatusChange: true,
  }) as {
    loading: boolean;
    data: OrdersStatisticsData | null;
  };
  const { loading: totalOrdersLoading, data: totalOrdersData } = useQuery(ORDERS_TOTAL_ORDERS, {
    variables: { destination },
    pollInterval: LONG_LONG_DURATION,
    notifyOnNetworkStatusChange: true,
  }) as {
    loading: boolean;
    data: OrdersTotalOrderData | null;
  };

  useEffect(() => {
    setDataSource(
      (totalOrdersData?.orderEntities?.nodes || []).map((node) => ({
        orderId: node.id.split('-')[1],
        deliveryRelayer: node.deliveredRelayerId?.split('-')[1],
        confirmationRelayer: node.confirmedRelayerId?.split('-')[1],
        assignedRelayer: node.assignedRelayerId?.split('-')[1],
        startBlock: node.createBlock,
        confirmBlock: node.finishBlock,
        time: node.finishTime,
      }))
    );
  }, [totalOrdersData?.orderEntities?.nodes]);

  const columns: ColumnsType<OrderData> = [
    {
      title: 'Order ID',
      key: 'orderId',
      dataIndex: 'orderId',
      render: (value) => {
        const searchParams = new URL(window.location.href).searchParams;
        searchParams.set('orderid', value);
        searchParams.set('dest', destination);
        return <NavLink to={`?${searchParams.toString()}`}>{value}</NavLink>;
      },
    },
    {
      title: 'Delivery Relayer',
      key: 'deliveryRelayer',
      dataIndex: 'deliveryRelayer',
      render: (value) => (value ? <IdentAccountName account={value} /> : '-'),
    },
    {
      title: 'Confirmation Relayer',
      key: 'confirmationRelayer',
      dataIndex: 'confirmationRelayer',
      render: (value) => (value ? <IdentAccountName account={value} /> : '-'),
    },
    {
      title: 'Assigned Relayer',
      key: 'assignedRelayer',
      dataIndex: 'assignedRelayer',
      render: (value) => (value ? <IdentAccountName account={value} /> : '-'),
    },
    {
      title: 'Start Block',
      key: 'startBlock',
      dataIndex: 'startBlock',
      render: (value) => <SubscanLink network={network.name} block={value} prefix="#" />,
    },
    {
      title: 'Confirm Block',
      key: 'confirmBlock',
      dataIndex: 'confirmBlock',
      render: (value) => (value ? <SubscanLink network={network.name} block={value} prefix="#" /> : '-'),
    },
    {
      title: 'Time',
      key: 'time',
      dataIndex: 'time',
      render: (value) => (value ? formatDistanceStrict(new Date(value), new Date()) : '-'),
    },
  ];

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const option: EChartsOption = {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        orient: 'vertical',
        top: 'center',
        right: '0',
        itemWidth: 10,
        itemHeight: 10,
        borderRadius: [0, 0, 0, 0],
      },
      series: [
        {
          name: 'Order Status',
          type: 'pie',
          radius: ['70%', '90%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
          },
          data: [
            { value: 999000, name: 'Finished' },
            { value: 120000, name: 'In-progress' },
            { value: 90000, name: 'Out-of-slot' },
          ],
        },
      ],
    };

    const instance = echarts.init(ref.current);
    instance.setOption(option);

    return () => instance.dispose();
  }, []);

  return (
    <>
      <Card>
        <div className="flex items-center justify-around">
          <Statistic
            value={statisticsData?.feeMarketEntity?.totalFinished || 0}
            title={
              <Spin size="small" spinning={statisticsLoading}>
                <div className="flex flex-col items-center">
                  <CheckCircleOutlined className="text-xl" />
                  <span>Finished</span>
                </div>
              </Spin>
            }
            valueStyle={{ textAlign: 'center' }}
          />
          <Statistic
            value={statisticsData?.feeMarketEntity?.totalInProgress || 0}
            title={
              <Spin size="small" spinning={statisticsLoading}>
                <div className="flex flex-col items-center">
                  <ClockCircleOutlined className="text-xl" />
                  <span>In Progress</span>
                </div>
              </Spin>
            }
            valueStyle={{ textAlign: 'center' }}
          />
          <Statistic
            value={statisticsData?.feeMarketEntity?.totalOutOfSlot || 0}
            title={
              <Spin size="small" spinning={statisticsLoading}>
                <div className="flex flex-col items-center">
                  <ExclamationCircleOutlined className="text-xl" />
                  <span>Out of Slot</span>
                </div>
              </Spin>
            }
            valueStyle={{ textAlign: 'center' }}
          />
          <div ref={ref} className="h-24 w-72" />
        </div>
      </Card>
      <Card className="mt-6">
        <div className="flex items-center space-x-2">
          <Input
            addonBefore={
              <Select defaultValue={1}>
                <Select.Option value={1}>Order ID</Select.Option>
                <Select.Option value={2}>Sender Address</Select.Option>
              </Select>
            }
            className="w-96"
          />
          <Button>Search</Button>
        </div>

        <Form
          layout="inline"
          className="mt-6"
          onValuesChange={({ timeDimension }) => {
            if (timeDimension) {
              setTimeDimension(timeDimension);
            }
          }}
        >
          <Form.Item name="timeDimension" label="Time Dimension">
            <Select className="w-20">
              <Select.Option value={1}>Date</Select.Option>
              <Select.Option value={2}>Block</Select.Option>
            </Select>
          </Form.Item>
          {timeDimension === 1 ? (
            <Form.Item name={`dateRange`} label="Date Range">
              <DatePicker.RangePicker />
            </Form.Item>
          ) : (
            <Form.Item name="block" label="Block">
              <InputNumber min={1} />
            </Form.Item>
          )}
          <Form.Item name={`state`} label="State">
            <Select className="w-32">
              <Select.Option value={0}>All</Select.Option>
              <Select.Option value={1}>
                <Badge color="green" text="Finished" />
              </Select.Option>
              <Select.Option value={2}>
                <Badge color="blue" text="In Progress" />
              </Select.Option>
              <Select.Option value={3}>
                <Badge color="gold" text="Out of Slot" />
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name={`slot`} label="Slot">
            <Select className="w-24">
              <Select.Option value={1}>All</Select.Option>
              <Select.Option value={2}>Slot 1</Select.Option>
              <Select.Option value={3}>Slot 2</Select.Option>
              <Select.Option value={4}>Slot 3</Select.Option>
              <Select.Option value={5}>Out of Slot</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit">Filter</Button>
          </Form.Item>
        </Form>
      </Card>
      <Card className="mt-2">
        <Table columns={columns} dataSource={dataSource} rowKey="orderId" loading={totalOrdersLoading} />
      </Card>
    </>
  );
};
