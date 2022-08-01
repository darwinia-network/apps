import { Card, Statistic, Table, Select, Input, Button, Form, DatePicker, Badge, InputNumber, Spin } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import type { Moment } from 'moment';
import { format } from 'date-fns';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import * as echarts from 'echarts/core';
import { TooltipComponent, TooltipComponentOption, LegendComponent, LegendComponentOption } from 'echarts/components';
import { PieChart, PieSeriesOption } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

import { ORDERS_STATISTICS, FEE_MARKET_ORDERS, DATE_TIME_FORMATE } from '../../config';
import { useApi, usePollIntervalQuery } from '../../hooks';
import {
  OrdersStatisticsData,
  FeeMarketOrders,
  CrossChainDestination,
  SearchParamsKey,
  FeeMarketTab,
  SlotState,
  OrderStatus,
  RelayerRole,
  SubqlOrderStatus,
  FinishedOrNot,
} from '../../model';
import { IdentAccountName } from '../widget/account/IdentAccountName';
import { SubscanLink } from '../widget/SubscanLink';

echarts.use([TooltipComponent, LegendComponent, PieChart, CanvasRenderer, LabelLayout]);

type EChartsOption = echarts.ComposeOption<TooltipComponentOption | LegendComponentOption | PieSeriesOption>;

type OrderData = {
  orderId: string;
  deliveryRelayer?: string | null;
  confirmationRelayer?: string | null;
  createBlock: number;
  finishBlock?: number | null;
  sender: string;
  status: SubqlOrderStatus;
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

type FilterStatus = FilterAll | FinishedOrNot;
const FilterStatus = { ...FilterAll, ...FinishedOrNot };

type FilterSlot = FilterAll | SlotState;
const FilterSlot = { ...FilterAll, ...SlotState };

type BlockFilterInputState = {
  start?: number | null;
  end?: number | null;
};

interface FilterData {
  dimension: TimeDimension;
  status: FilterStatus;
  slot: FilterSlot;
  block?: BlockFilterInputState | null;
  duration?: [start: Moment, end: Moment] | null;
}

const BlockFilterInput = ({
  value,
  onChange = (_) => undefined,
}: {
  value?: BlockFilterInputState;
  onChange?: (value: BlockFilterInputState) => void;
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between items-center space-x-2">
      <InputNumber
        min={1}
        step={1}
        placeholder={t('Start block')}
        onChange={(v) => {
          onChange({ start: v, end: value?.end });
        }}
      />
      <span>-</span>
      <InputNumber
        min={1}
        step={1}
        placeholder={t('End block')}
        onChange={(v) => {
          onChange({
            start: value?.start,
            end: v,
          });
        }}
      />
    </div>
  );
};

// eslint-disable-next-line complexity
export const Orders = ({
  destination,
  setRefresh,
}: {
  destination: CrossChainDestination;
  setRefresh: (fn: () => void) => void;
}) => {
  const { network } = useApi();
  const { t } = useTranslation();
  const dataSourceRef = useRef<OrderData[]>([]);
  const statisticCharRef = useRef<HTMLDivElement>(null);
  const [dataSource, setDataSource] = useState<OrderData[]>([]);
  const [search, setSearch] = useState<SearchData>({ type: SearchType.ORDER_ID, value: '' });
  const [filter, setFilter] = useState<FilterData>({
    dimension: TimeDimension.DATE,
    status: FilterStatus.ALL,
    slot: FilterSlot.ALL,
  });
  const {
    loading: statisticsLoading,
    data: statisticsData,
    refetch: refetchStatistics,
  } = usePollIntervalQuery<OrdersStatisticsData, { destination: string }>(ORDERS_STATISTICS, {
    variables: { destination },
  });
  const {
    loading: totalOrdersLoading,
    data: totalOrdersData,
    refetch: refetchTotalOrders,
  } = usePollIntervalQuery<FeeMarketOrders, { destination: string }>(FEE_MARKET_ORDERS, {
    variables: { destination },
  });

  const columns: ColumnsType<OrderData> = [
    {
      title: t('Order ID'),
      key: 'orderId',
      dataIndex: 'orderId',
      width: '10%',
      align: 'center',
      render: (value, record) => {
        const searchParams = new URLSearchParams();
        searchParams.set(SearchParamsKey.RPC, encodeURIComponent(network.provider.rpc));
        searchParams.set(SearchParamsKey.DESTINATION, destination);
        searchParams.set(SearchParamsKey.TAB, FeeMarketTab.OREDERS);
        searchParams.set(SearchParamsKey.ORDER, value);
        return (
          <div className="inline-flex items-center">
            {record.status === SubqlOrderStatus.IN_PROGRESS ? (
              <Badge status="processing" />
            ) : record.status === SubqlOrderStatus.OUT_OF_SLOT ? (
              <Badge status="warning" />
            ) : (
              <Badge status="success" />
            )}
            <NavLink to={`?${searchParams.toString()}`}>{value}</NavLink>
          </div>
        );
      },
    },
    {
      title: t(RelayerRole.DELIVERY),
      key: 'deliveryRelayer',
      dataIndex: 'deliveryRelayer',
      align: 'center',
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
      title: t(RelayerRole.CONFIRMED),
      key: 'confirmationRelayer',
      dataIndex: 'confirmationRelayer',
      align: 'center',
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
      title: t('Created At'),
      key: 'createBlock',
      dataIndex: 'createBlock',
      align: 'center',
      render: (value, record) => (
        <div className="flex flex-col justify-center">
          <SubscanLink network={network.name} block={value} prefix="#" />
          <span>{format(new Date(record.createTime), DATE_TIME_FORMATE)} (+UTC)</span>
        </div>
      ),
    },
    {
      title: t('Confirmed At'),
      key: 'finishBlock',
      dataIndex: 'finishBlock',
      align: 'center',
      render: (value, record) =>
        value ? (
          <div className="flex flex-col justify-center">
            <SubscanLink network={network.name} block={value} prefix="#" />
            {record.finishTime ? <span>{format(new Date(record.finishTime), DATE_TIME_FORMATE)} (+UTC)</span> : null}
          </div>
        ) : (
          '-'
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
    const { duration, block, status, slot } = values;

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

        if (
          block &&
          !(
            (block.start ? block.start <= item.createBlock : true) &&
            (block.end && item.finishBlock ? item.finishBlock <= block.end : true)
          )
        ) {
          return false;
        }

        switch (status) {
          // case FilterStatus.ALL:
          case FilterStatus.FINISHED:
            if (item.status !== SubqlOrderStatus.FINISHED) {
              return false;
            }
            break;
          case FilterStatus.IN_PROGRESS:
            if (item.status === SubqlOrderStatus.FINISHED) {
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
            if (!(item.confirmedSlotIndex === -1 || item.status === SubqlOrderStatus.OUT_OF_SLOT)) {
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
      color: ['#91cc75', '#5470c6', '#fac858'],
      legend: {
        orient: 'vertical',
        top: 'center',
        left: '40%',
        show: true,
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
          center: ['20%', '50%'],
          data: [
            {
              value: statisticsData?.feeMarketEntity?.totalFinished || 0,
              name: t(OrderStatus.FINISHED) as string,
            },
            {
              value: statisticsData?.feeMarketEntity?.totalInProgress || 0,
              name: `${t(OrderStatus.IN_PROGRESS)} (${t('In Slot')})`,
            },
            {
              value: statisticsData?.feeMarketEntity?.totalOutOfSlot || 0,
              name: `${t(OrderStatus.IN_PROGRESS)} (${t(OrderStatus.OUT_OF_SLOT)})`,
            },
          ],
        },
      ],
    };

    const instance = echarts.init(statisticCharRef.current);
    instance.setOption(option);

    return () => instance.dispose();
  }, [statisticsData?.feeMarketEntity, t]);

  useEffect(() => {
    setRefresh(() => () => {
      refetchStatistics();
      refetchTotalOrders();
    });
  }, [setRefresh, refetchStatistics, refetchTotalOrders]);

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
                  <span>{`${t(OrderStatus.IN_PROGRESS)} (${t('In Slot')})`}</span>
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
                  <span>{`${t(OrderStatus.IN_PROGRESS)} (${t(OrderStatus.OUT_OF_SLOT)})`}</span>
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
          initialValues={{ dimension: filter.dimension, status: filter.status, slot: filter.slot }}
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
              <BlockFilterInput />
            </Form.Item>
          )}
          <Form.Item name={`status`} label={t('Finished Status')}>
            <Select className="w-32">
              <Select.Option value={FilterStatus.ALL}>{t(FilterStatus.ALL)}</Select.Option>
              <Select.Option value={FilterStatus.FINISHED}>
                <Badge status="success" text={t(FilterStatus.FINISHED)} />
              </Select.Option>
              <Select.Option value={FilterStatus.IN_PROGRESS}>
                <Badge status="processing" text={t(FilterStatus.IN_PROGRESS)} />
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
