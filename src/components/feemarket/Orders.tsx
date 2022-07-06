import { Card, Statistic, Table, Select, Input, Button, Form, DatePicker, Badge, InputNumber, Spin } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import type { Moment } from 'moment';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import * as echarts from 'echarts/core';
import { TooltipComponent, TooltipComponentOption, LegendComponent, LegendComponentOption } from 'echarts/components';
import { PieChart, PieSeriesOption } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

import { ORDERS_STATISTICS, ORDERS_TOTAL_ORDERS, LONG_LONG_DURATION } from '../../config';
import { useApi } from '../../hooks';
import {
  OrdersStatisticsData,
  OrdersTotalOrderData,
  CrossChainDestination,
  SearchParamsKey,
  FeeMarketTab,
  SlotState,
  OrderStatus,
  RelayerRole,
} from '../../model';
import { IdentAccountName } from '../widget/account/IdentAccountName';
import { SubscanLink } from '../widget/SubscanLink';

echarts.use([TooltipComponent, LegendComponent, PieChart, CanvasRenderer, LabelLayout]);

type EChartsOption = echarts.ComposeOption<TooltipComponentOption | LegendComponentOption | PieSeriesOption>;

type OrderData = {
  orderId: string;
  deliveryRelayer?: string | null;
  confirmationRelayer?: string | null;
  assignedRelayer?: string;
  createBlock: number;
  finishBlock?: number | null;
  sender: string;
  createTime: string;
  finishTime?: string | null;
  confirmedSlotIndex: number | null;
};

enum SearchType {
  ORDER_ID = 'Order ID',
  SENDER_ADDRESS = 'Sender Address',
}

type SearchData = {
  type: SearchType;
  value: string;
};

enum TimeDimension {
  DATE = 'Date',
  BLOCK = 'Block',
}

enum FilterAll {
  ALL = 'All',
}

type FilterState = FilterAll | OrderStatus;
const FilterState = { ...FilterAll, ...OrderStatus };

type FilterSlot = FilterAll | SlotState;
const FilterSlot = { ...FilterAll, ...SlotState };

interface FilterData {
  dimension: TimeDimension;
  state: FilterState;
  slot: FilterSlot;
  block?: number | null;
  duration?: [start: Moment, end: Moment] | null;
}

// eslint-disable-next-line complexity
export const Orders = ({ destination }: { destination: CrossChainDestination }) => {
  const { network } = useApi();
  const { t } = useTranslation();
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
      title: t('Order ID'),
      key: 'orderId',
      dataIndex: 'orderId',
      width: '6%',
      align: 'center',
      render: (value) => {
        const searchParams = new URLSearchParams();
        searchParams.set(SearchParamsKey.TAB, FeeMarketTab.OREDERS);
        searchParams.set(SearchParamsKey.ORDER, value);
        searchParams.set(SearchParamsKey.DESTINATION, destination);
        return <NavLink to={`?${searchParams.toString()}`}>{value}</NavLink>;
      },
    },
    {
      title: (
        <div className="flex justify-center">
          <span>{t(RelayerRole.ASSIGNED)}</span>
        </div>
      ),
      key: 'assignedRelayer',
      dataIndex: 'assignedRelayer',
      render: (value) =>
        value ? (
          <IdentAccountName account={value} />
        ) : (
          <div className="flex justify-center">
            <span>-</span>
          </div>
        ),
    },
    {
      title: (
        <div className="flex justify-center">
          <span>{t(RelayerRole.DELIVERY)}</span>
        </div>
      ),
      key: 'deliveryRelayer',
      dataIndex: 'deliveryRelayer',
      render: (value) =>
        value ? (
          <IdentAccountName account={value} />
        ) : (
          <div className="flex justify-center">
            <span>-</span>
          </div>
        ),
    },
    {
      title: (
        <div className="flex justify-center">
          <span>{t(RelayerRole.CONFIRMED)}</span>
        </div>
      ),
      key: 'confirmationRelayer',
      dataIndex: 'confirmationRelayer',
      render: (value) =>
        value ? (
          <IdentAccountName account={value} />
        ) : (
          <div className="flex justify-center">
            <span>-</span>
          </div>
        ),
    },
    {
      title: t('Start Block'),
      key: 'createBlock',
      dataIndex: 'createBlock',
      align: 'center',
      render: (value, record) => (
        <div className="flex flex-col justify-center">
          <SubscanLink network={network.name} block={value} prefix="#" />
          <span>({record.createTime})</span>
        </div>
      ),
    },
    {
      title: t('Confirm Block'),
      key: 'finishBlock',
      dataIndex: 'finishBlock',
      align: 'center',
      render: (value, record) =>
        value ? (
          <div className="flex flex-col justify-center">
            <SubscanLink network={network.name} block={value} prefix="#" />
            {record.finishTime ? <span>({record.finishTime})</span> : null}
          </div>
        ) : (
          '-'
        ),
    },
    {
      title: t('Status'),
      key: 'status',
      align: 'center',
      render: (_, record) =>
        record.confirmedSlotIndex === null ? (
          <Badge status="processing" text={FilterState.IN_PROGRESS} />
        ) : record.confirmedSlotIndex === -1 ? (
          <Badge status="warning" text={FilterState.OUT_OF_SLOT} />
        ) : (
          <Badge status="success" text={FilterState.FINISHED} />
        ),
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
        if (duration) {
          const dateFormat = 'YYYY-MM-DD';
          const durationStart = duration[0].format(dateFormat);
          const durationEnd = duration[1].format(dateFormat);

          const createTime = moment(item.createTime.split('T')[0]);
          const finishTime = item.finishTime ? moment(item.finishTime.split('T')[0]) : null;

          if (
            !(
              createTime.isBetween(durationStart, durationEnd, undefined, '[]') ||
              (finishTime && finishTime.isBetween(durationStart, durationEnd, undefined, '[]'))
            )
          ) {
            return false;
          }
        }

        if (block && !(item.createBlock === block || item.finishBlock === block)) {
          return false;
        }

        switch (state) {
          // case FilterState.ALL:
          case FilterState.FINISHED:
            if (!(item.confirmedSlotIndex !== null)) {
              return false;
            }
            break;
          case FilterState.IN_PROGRESS:
            if (!(item.confirmedSlotIndex === null)) {
              return false;
            }
            break;
          case FilterState.OUT_OF_SLOT:
            if (!(item.confirmedSlotIndex === -1)) {
              return false;
            }
            break;
        }

        switch (slot) {
          // case FilterSlot.ALL:
          case FilterSlot.SLOT_1:
            if (!(item.confirmedSlotIndex === 0)) {
              return false;
            }
            break;
          case FilterSlot.SLOT_2:
            if (!(item.confirmedSlotIndex === 1)) {
              return false;
            }
            break;
          case FilterSlot.SLOT_3:
            // eslint-disable-next-line no-magic-numbers
            if (!(item.confirmedSlotIndex === 2)) {
              return false;
            }
            break;
          case FilterSlot.OUT_OF_SLOT:
            if (!(item.confirmedSlotIndex === -1)) {
              return false;
            }
            break;
        }

        return true;
      })
    );
  }, []);

  useEffect(() => {
    dataSourceRef.current = (totalOrdersData?.orderEntities?.nodes || []).map((node) => ({
      ...node,
      orderId: node.id.split('-')[1],
      deliveryRelayer: node.deliveredRelayerId?.split('-')[1],
      confirmationRelayer: node.confirmedRelayerId?.split('-')[1],
      assignedRelayer: node.assignedRelayerId?.split('-')[1],
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
            { value: statisticsData?.feeMarketEntity?.totalFinished || 0, name: t(OrderStatus.FINISHED) as string },
            {
              value: statisticsData?.feeMarketEntity?.totalInProgress || 0,
              name: t(OrderStatus.IN_PROGRESS) as string,
            },
            { value: statisticsData?.feeMarketEntity?.totalOutOfSlot || 0, name: t(OrderStatus.OUT_OF_SLOT) as string },
          ],
        },
      ],
    };

    const instance = echarts.init(statisticCharRef.current);
    instance.setOption(option);

    return () => instance.dispose();
  }, [statisticsData?.feeMarketEntity, t]);

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
                  <span>{t(OrderStatus.FINISHED)}</span>
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
                  <span>{t(OrderStatus.IN_PROGRESS)}</span>
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
                  <span>{t(OrderStatus.OUT_OF_SLOT)}</span>
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
                <Select.Option value={SearchType.ORDER_ID}>{t(SearchType.ORDER_ID)}</Select.Option>
                <Select.Option value={SearchType.SENDER_ADDRESS}>{t(SearchType.SENDER_ADDRESS)}</Select.Option>
              </Select>
            }
            className="w-96"
            onChange={(e) => setSearch((prev) => ({ ...prev, value: e.target.value }))}
          />
          <Button onClick={handleSearch}>{t('Search')}</Button>
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
          <Form.Item name="dimension" label={t('Time Dimension')}>
            <Select className="w-20">
              <Select.Option value={TimeDimension.DATE}>{t(TimeDimension.DATE)}</Select.Option>
              <Select.Option value={TimeDimension.BLOCK}>{t(TimeDimension.BLOCK)}</Select.Option>
            </Select>
          </Form.Item>
          {filter.dimension === TimeDimension.DATE ? (
            <Form.Item name="duration" label={t('Date Range')}>
              <DatePicker.RangePicker format="YYYY-MM-DD" />
            </Form.Item>
          ) : (
            <Form.Item name="block" label={t('Block')}>
              <InputNumber min={1} step={1} />
            </Form.Item>
          )}
          <Form.Item name={`state`} label={t('State')}>
            <Select className="w-32">
              <Select.Option value={FilterState.ALL}>{t(FilterState.ALL)}</Select.Option>
              <Select.Option value={FilterState.FINISHED}>
                <Badge status="success" text={t(FilterState.FINISHED)} />
              </Select.Option>
              <Select.Option value={FilterState.IN_PROGRESS}>
                <Badge status="processing" text={t(FilterState.IN_PROGRESS)} />
              </Select.Option>
              <Select.Option value={FilterState.OUT_OF_SLOT}>
                <Badge status="warning" text={t(FilterState.OUT_OF_SLOT)} />
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name={`slot`} label={t('Slot')}>
            <Select className="w-24">
              <Select.Option value={FilterSlot.ALL}>{t(FilterSlot.ALL)}</Select.Option>
              <Select.Option value={FilterSlot.SLOT_1}>{t(FilterSlot.SLOT_1)}</Select.Option>
              <Select.Option value={FilterSlot.SLOT_2}>{t(FilterSlot.SLOT_2)}</Select.Option>
              <Select.Option value={FilterSlot.SLOT_3}>{t(FilterSlot.SLOT_3)}</Select.Option>
              <Select.Option value={FilterSlot.OUT_OF_SLOT}>{t(FilterSlot.OUT_OF_SLOT)}</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit">{t('Filter')}</Button>
          </Form.Item>
        </Form>
      </Card>
      <Card className="mt-2">
        <Table columns={columns} dataSource={dataSource} rowKey="orderId" loading={totalOrdersLoading} />
      </Card>
    </>
  );
};
