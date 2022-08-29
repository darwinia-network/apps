import { Card, Statistic, Table, Select, Input, Button, Form, DatePicker, Badge, InputNumber, Spin } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import type { Moment } from 'moment';
import { format } from 'date-fns';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { ORDERS_STATISTICS, ORDERS_OVERVIEW, DATE_TIME_FORMATE } from '../../config';
import { useApi, useCustomQuery } from '../../hooks';
import {
  DarwiniaChain,
  SearchParamsKey,
  FeeMarketTab,
  SlotState,
  OrderStatus,
  TOrdersStatistics,
  TOrdersOverview,
} from '../../model';
import { IdentAccountName } from '../widget/account/IdentAccountName';
import { SubscanLink } from '../widget/SubscanLink';
import { OrdersStatisticsChart } from './OrdersStatisticsChart';

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

type FilterStatus = FilterAll | OrderStatus;
const FilterStatus = { ...FilterAll, ...OrderStatus };

type FilterSlot = FilterAll | SlotState;
const FilterSlot = { ...FilterAll, ...SlotState };

interface BlockRange {
  start?: number | null;
  end?: number | null;
}

interface FilterData {
  dimension: TimeDimension;
  status: FilterStatus;
  slot: FilterSlot;
  block?: BlockRange | null;
  duration?: [start: Moment, end: Moment] | null;
}

interface DataSourceState {
  lane: string;
  nonce: string;
  sender?: string | null;
  status: OrderStatus;
  deliveredRelayer?: string | null;
  confirmedRelayer?: string | null;
  createBlockTime: string;
  finishBlockTime?: string | null;
  createBlockNumber: number;
  finishBlockNumber?: number | null;
  confirmedSlotIndex?: number | null;
}

const BlockRangeInput = ({
  value,
  onChange = (_) => undefined,
}: {
  value?: BlockRange;
  onChange?: (range: BlockRange) => void;
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
        className="w-28"
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
        className="w-28"
      />
    </div>
  );
};

// eslint-disable-next-line complexity
export const Orders = ({
  destination,
  setRefresh,
}: {
  destination: DarwiniaChain;
  setRefresh: (fn: () => void) => void;
}) => {
  const { network } = useApi();
  const { t } = useTranslation();

  const dataSourceRef = useRef<DataSourceState[]>([]);
  const [dataSource, setDataSource] = useState<DataSourceState[]>([]);

  const [search, setSearch] = useState<SearchData>({ type: SearchType.ORDER_ID, value: '' });
  const [filter, setFilter] = useState<FilterData>({
    dimension: TimeDimension.DATE,
    status: FilterStatus.ALL,
    slot: FilterSlot.ALL,
  });

  const {
    loading: ordersStatisticsLoading,
    data: ordersStatisticsData,
    refetch: refetchOrdersStatistics,
  } = useCustomQuery<TOrdersStatistics, { destination: string }>(ORDERS_STATISTICS, {
    variables: { destination },
  });

  const {
    loading: ordersOverviewLoading,
    data: ordersOverviewData,
    refetch: refetchOrdersOverview,
  } = useCustomQuery<TOrdersOverview, { destination: string }>(ORDERS_OVERVIEW, {
    variables: { destination },
  });

  const columns: ColumnsType<DataSourceState> = [
    {
      title: t('Order ID'),
      width: '10%',
      align: 'center',
      render: (_, record) => {
        const searchParams = new URLSearchParams();
        searchParams.set(SearchParamsKey.RPC, encodeURIComponent(network.provider.rpc));
        searchParams.set(SearchParamsKey.DESTINATION, destination);
        searchParams.set(SearchParamsKey.TAB, FeeMarketTab.OREDERS);
        searchParams.set(SearchParamsKey.LANE, record.lane);
        searchParams.set(SearchParamsKey.NONCE, record.nonce.toString());
        return (
          <div className="inline-flex items-center">
            {record.status === OrderStatus.FINISHED ? <Badge status="success" /> : <Badge status="processing" />}
            <NavLink to={`?${searchParams.toString()}`}>{record.nonce}</NavLink>
          </div>
        );
      },
    },
    {
      title: t('Delivery Relayer'),
      align: 'center',
      render: (_, record) =>
        record.deliveredRelayer ? (
          <IdentAccountName account={record.deliveredRelayer} />
        ) : (
          <div className="flex justify-center">
            <span>-</span>
          </div>
        ),
    },
    {
      title: t('Confirmation Relayer'),
      align: 'center',
      render: (_, record) =>
        record.confirmedRelayer ? (
          <IdentAccountName account={record.confirmedRelayer} />
        ) : (
          <div className="flex justify-center">
            <span>-</span>
          </div>
        ),
    },
    {
      title: t('Created At'),
      align: 'center',
      render: (_, record) => (
        <div className="flex flex-col justify-center">
          <SubscanLink network={network.name} block={record.createBlockNumber.toString()} prefix="#" />
          <span>{format(new Date(`${record.createBlockTime}Z`), DATE_TIME_FORMATE)} (+UTC)</span>
        </div>
      ),
    },
    {
      title: t('Confirmed At'),
      align: 'center',
      render: (_, record) =>
        record.finishBlockNumber && record.finishBlockTime ? (
          <div className="flex flex-col justify-center">
            <SubscanLink network={network.name} block={record.finishBlockNumber.toString()} prefix="#" />
            {record.finishBlockTime ? (
              <span>{format(new Date(`${record.finishBlockTime}Z`), DATE_TIME_FORMATE)} (+UTC)</span>
            ) : null}
          </div>
        ) : (
          '-'
        ),
    },
  ];

  const handleSearch = useCallback(() => {
    if (search.value) {
      if (search.type === SearchType.ORDER_ID) {
        // eslint-disable-next-line no-magic-numbers
        setDataSource(dataSourceRef.current.filter((item) => item.nonce.toString() === search.value));
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
          const momentFormat = 'YYYY-MM-DD';
          const filterStart = duration[0].format(momentFormat);
          const filterEnd = duration[1].format(momentFormat);

          const createTime = moment(item.createBlockTime.split('T')[0]);
          const finishTime = item.finishBlockTime ? moment(item.finishBlockTime.split('T')[0]) : null;

          const match =
            createTime.isBetween(filterStart, filterEnd, undefined, '[]') ||
            (finishTime && finishTime.isBetween(filterStart, filterEnd, undefined, '[]'));

          if (!match) {
            return false;
          }
        }

        if (block) {
          const match =
            (block.start ? block.start <= item.createBlockNumber : true) &&
            (block.end && item.finishBlockNumber ? item.finishBlockNumber <= block.end : true);

          if (!match) {
            return false;
          }
        }

        switch (status) {
          case FilterStatus.FINISHED:
            if (item.status !== 'Finished') {
              return false;
            }
            break;
          case FilterStatus.IN_PROGRESS:
            if (item.status !== 'InProgress') {
              return false;
            }
            break;
        }

        switch (slot) {
          case FilterSlot.SLOT_1:
            if (item.confirmedSlotIndex !== 0) {
              return false;
            }
            break;
          case FilterSlot.SLOT_2:
            if (item.confirmedSlotIndex !== 1) {
              return false;
            }
            break;
          case FilterSlot.SLOT_3:
            // eslint-disable-next-line no-magic-numbers
            if (item.confirmedSlotIndex !== 2) {
              return false;
            }
            break;
          case FilterSlot.OUT_OF_SLOT:
            if (item.confirmedSlotIndex !== -1) {
              return false;
            }
            break;
        }

        return true;
      })
    );
  }, []);

  useEffect(() => {
    dataSourceRef.current = (ordersOverviewData?.orders?.nodes || [])
      .map((node) => {
        return {
          ...node,
          deliveredRelayer: node.deliveryRelayers?.nodes[0].deliveryRelayer?.address,
          confirmedRelayer: node.confirmationRelayers?.nodes[0].confirmationRelayer?.address,
        };
      })
      .sort((a, b) => b.createBlockNumber - a.createBlockNumber);
    setDataSource(dataSourceRef.current);
  }, [ordersOverviewData?.orders?.nodes]);

  useEffect(() => {
    setRefresh(() => () => {
      refetchOrdersStatistics();
      refetchOrdersOverview();
    });
  }, [setRefresh, refetchOrdersStatistics, refetchOrdersOverview]);

  return (
    <>
      <Card>
        <div className="flex items-center justify-around">
          <Statistic
            value={ordersStatisticsData?.market?.finishedOrders || 0}
            title={
              <Spin size="small" spinning={ordersStatisticsLoading}>
                <div className="flex flex-col items-center">
                  <CheckCircleOutlined className="text-xl" />
                  <span>{t('Finished')}</span>
                </div>
              </Spin>
            }
            valueStyle={{ textAlign: 'center' }}
          />
          <Statistic
            value={ordersStatisticsData?.market?.unfinishedInSlotOrders || 0}
            title={
              <Spin size="small" spinning={ordersStatisticsLoading}>
                <div className="flex flex-col items-center">
                  <ClockCircleOutlined className="text-xl" />
                  <span>{`${t('In Progress')} (${t('In Slot')})`}</span>
                </div>
              </Spin>
            }
            valueStyle={{ textAlign: 'center' }}
          />
          <Statistic
            value={ordersStatisticsData?.market?.unfinishedOutOfSlotOrders || 0}
            title={
              <Spin size="small" spinning={ordersStatisticsLoading}>
                <div className="flex flex-col items-center">
                  <ExclamationCircleOutlined className="text-xl" />
                  <span>{`${t('In Progress')} (${t('Out of Slot')})`}</span>
                </div>
              </Spin>
            }
            valueStyle={{ textAlign: 'center' }}
          />
          <OrdersStatisticsChart
            finished={ordersStatisticsData?.market?.finishedOrders || 0}
            inSlot={ordersStatisticsData?.market?.unfinishedInSlotOrders || 0}
            outOfSlot={ordersStatisticsData?.market?.unfinishedOutOfSlotOrders || 0}
          />
        </div>
      </Card>
      <Card className="mt-6">
        <div className="flex items-center space-x-2">
          <Input
            addonBefore={
              <Select
                value={search.type}
                onSelect={(type) => setSearch((prev) => ({ ...prev, type }))}
                className="w-36"
              >
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
              <BlockRangeInput />
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
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey={(record) => `${record.lane}-${record.nonce}`}
          loading={ordersOverviewLoading}
        />
      </Card>
    </>
  );
};
