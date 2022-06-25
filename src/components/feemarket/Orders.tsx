import { Card, Statistic, Table, Select, Input, Button, Form, DatePicker, Badge, InputNumber, Spin } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { formatDistanceStrict } from 'date-fns';
import type { Moment } from 'moment';

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
  deliveryRelayer?: string | null;
  confirmationRelayer?: string | null;
  assignedRelayer?: string;
  startBlock: number;
  confirmBlock?: number | null;
  sender: string;
  createTime: string;
  finishTime?: string | null;
  confirmedSlotIndex: number | null;
};

enum SearchType {
  ORDER_ID = 'Order ID',
  SENDER_ADDRESS = 'Sendet Address',
}

type SearchData = {
  type: SearchType;
  value: string;
};

enum TimeDimension {
  DATE = 'Date',
  BLOCK = 'Block',
}

enum FilterState {
  ALL = 'All',
  FINISHED = 'Finished',
  IN_PROGRESS = 'In Progress',
  OUT_OF_SLOT = 'Out of Slot',
}

enum FilterSlot {
  ALL = 'All',
  SLOT_1 = 'Slot 1',
  SLOT_2 = 'Slot 2',
  SLOT_3 = 'Slot 3',
  OUT_OF_SLOT = 'Out of Slot',
}

interface FilterData {
  dimension: TimeDimension;
  state: FilterState;
  slot: FilterSlot;
  block?: number | null;
  duration?: [start: Moment, end: Moment] | null;
}

// eslint-disable-next-line complexity
export const Orders = () => {
  const { network } = useApi();
  const { destination } = useFeeMarket();
  const dataSourceRef = useRef<OrderData[]>([]);
  const statisticCharRef = useRef<HTMLDivElement>(null);
  const [dataSource, setDataSource] = useState<OrderData[]>([]);
  const [search, setSearch] = useState<SearchData>({ type: SearchType.ORDER_ID, value: '' });
  const [filter, setFilter] = useState<FilterData>({
    dimension: TimeDimension.DATE,
    state: FilterState.ALL,
    slot: FilterSlot.ALL,
  });
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
      key: 'finishTime',
      dataIndex: 'finishTime',
      render: (value) => (value ? formatDistanceStrict(new Date(value), new Date()) : '-'),
    },
  ];

  const handleSearch = useCallback(() => {
    if (search.value) {
      if (search.type === SearchType.ORDER_ID) {
        setDataSource(dataSourceRef.current.filter((item) => item.orderId === search.value));
      } else if (search.type === SearchType.SENDER_ADDRESS) {
        setDataSource(dataSourceRef.current.filter((item) => item.sender === search.value));
      }
    } else {
      setDataSource(dataSourceRef.current);
    }
  }, [search]);

  const handleFilter = useCallback((values: FilterData) => {
    const { duration, block, state, slot } = values;

    setDataSource(
      // eslint-disable-next-line complexity
      dataSourceRef.current.filter((item) => {
        let match: boolean | undefined = undefined;

        if (duration) {
          match =
            duration[0].isBefore(item.createTime) && (item.finishTime ? duration[1].isAfter(item.finishTime) : true);
        }

        if (block) {
          match = (match === undefined || match) && (item.startBlock === block || item.confirmBlock === block);
        }

        switch (state) {
          // case FilterState.ALL:
          case FilterState.FINISHED:
            match = (match === undefined || match) && item.confirmedSlotIndex !== null;
            break;
          case FilterState.IN_PROGRESS:
            match = (match === undefined || match) && item.confirmedSlotIndex === null;
            break;
          case FilterState.OUT_OF_SLOT:
            match = (match === undefined || match) && item.confirmedSlotIndex === -1;
            break;
        }

        switch (slot) {
          // case FilterSlot.ALL:
          case FilterSlot.SLOT_1:
            match = (match === undefined || match) && item.confirmedSlotIndex === 0;
            break;
          case FilterSlot.SLOT_2:
            match = (match === undefined || match) && item.confirmedSlotIndex === 1;
            break;
          case FilterSlot.SLOT_3:
            match = (match === undefined || match) && item.confirmedSlotIndex === 2; // eslint-disable-line no-magic-numbers
            break;
          case FilterSlot.OUT_OF_SLOT:
            match = (match === undefined || match) && item.confirmedSlotIndex === -1;
            break;
        }

        return match === undefined || match;
      })
    );
  }, []);

  useEffect(() => {
    dataSourceRef.current = (totalOrdersData?.orderEntities?.nodes || []).map((node) => ({
      orderId: node.id.split('-')[1],
      deliveryRelayer: node.deliveredRelayerId?.split('-')[1],
      confirmationRelayer: node.confirmedRelayerId?.split('-')[1],
      assignedRelayer: node.assignedRelayerId?.split('-')[1],
      startBlock: node.createBlock,
      confirmBlock: node.finishBlock,
      createTime: node.createTime,
      finishTime: node.finishTime,
      sender: node.sender,
      confirmedSlotIndex: node.confirmedSlotIndex,
    }));

    setDataSource(dataSourceRef.current);
  }, [totalOrdersData?.orderEntities?.nodes]);

  useEffect(() => {
    if (!statisticCharRef.current) {
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

    const instance = echarts.init(statisticCharRef.current);
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
          <div ref={statisticCharRef} className="h-24 w-72" />
        </div>
      </Card>
      <Card className="mt-6">
        <div className="flex items-center space-x-2">
          <Input
            addonBefore={
              <Select value={search.type} onSelect={(type) => setSearch((prev) => ({ ...prev, type }))}>
                <Select.Option value={SearchType.ORDER_ID}>{SearchType.ORDER_ID}</Select.Option>
                <Select.Option value={SearchType.SENDER_ADDRESS}>{SearchType.SENDER_ADDRESS}</Select.Option>
              </Select>
            }
            className="w-96"
            onChange={(e) => setSearch((prev) => ({ ...prev, value: e.target.value }))}
          />
          <Button onClick={handleSearch}>Search</Button>
        </div>

        <Form<FilterData>
          layout="inline"
          className="mt-6"
          onValuesChange={(changedValues: Partial<FilterData>) => {
            const { dimension } = changedValues;

            if (dimension) {
              setFilter((prev) => ({ ...prev, dimension }));
            }
          }}
          initialValues={{ dimension: filter.dimension, state: filter.state, slot: filter.slot }}
          onFinish={handleFilter}
        >
          <Form.Item name="dimension" label="Time Dimension">
            <Select className="w-20">
              <Select.Option value={TimeDimension.DATE}>{TimeDimension.DATE}</Select.Option>
              <Select.Option value={TimeDimension.BLOCK}>{TimeDimension.BLOCK}</Select.Option>
            </Select>
          </Form.Item>
          {filter.dimension === TimeDimension.DATE ? (
            <Form.Item name="duration" label="Date Range">
              <DatePicker.RangePicker />
            </Form.Item>
          ) : (
            <Form.Item name="block" label="Block">
              <InputNumber min={1} step={1} />
            </Form.Item>
          )}
          <Form.Item name={`state`} label="State">
            <Select className="w-32">
              <Select.Option value={FilterState.ALL}>{FilterState.ALL}</Select.Option>
              <Select.Option value={FilterState.FINISHED}>
                <Badge color="green" text={FilterState.FINISHED} />
              </Select.Option>
              <Select.Option value={FilterState.IN_PROGRESS}>
                <Badge color="blue" text={FilterState.IN_PROGRESS} />
              </Select.Option>
              <Select.Option value={FilterState.OUT_OF_SLOT}>
                <Badge color="gold" text={FilterState.OUT_OF_SLOT} />
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name={`slot`} label="Slot">
            <Select className="w-24">
              <Select.Option value={FilterSlot.ALL}>{FilterSlot.ALL}</Select.Option>
              <Select.Option value={FilterSlot.SLOT_1}>{FilterSlot.SLOT_1}</Select.Option>
              <Select.Option value={FilterSlot.SLOT_2}>{FilterSlot.SLOT_2}</Select.Option>
              <Select.Option value={FilterSlot.SLOT_3}>{FilterSlot.SLOT_3}</Select.Option>
              <Select.Option value={FilterSlot.OUT_OF_SLOT}>{FilterSlot.OUT_OF_SLOT}</Select.Option>
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
