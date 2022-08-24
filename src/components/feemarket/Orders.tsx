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
import { useApi, useMyQuery } from '../../hooks';
import {
  DarwiniaChain,
  SearchParamsKey,
  FeeMarketTab,
  SlotState,
  OrderStatus,
  RelayerRole,
  FinishedOrNot,
  TOrdersStatistics,
  TOrdersOverview,
} from '../../model';
import { IdentAccountName } from '../widget/account/IdentAccountName';
import { SubscanLink } from '../widget/SubscanLink';
import { OrdersStatisticsChart } from './OrdersStatisticsChart';

type OrderData = {
  id: string;
  sender?: string | null;
  deliveredRelayersId?: string[] | null;
  confirmedRelayersId?: string[] | null;
  createBlockNumber: number;
  finishBlockNumber: number | null;
  createBlockTime: string;
  finishBlockTime?: string | null;
  status: OrderStatus;
  confirmedSlotIndex?: number | null;
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
  const dataSourceRef = useRef<OrderData[]>([]);
  const [dataSource, setDataSource] = useState<OrderData[]>([]);
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
  } = useMyQuery<TOrdersStatistics, { destination: string }>(ORDERS_STATISTICS, {
    variables: { destination },
  });
  const {
    loading: ordersOverviewLoading,
    data: ordersOverviewData,
    refetch: refetchOrdersOverview,
  } = useMyQuery<TOrdersOverview, { destination: string }>(ORDERS_OVERVIEW, {
    variables: { destination },
  });

  const columns: ColumnsType<OrderData> = [
    {
      title: t('Order ID'),
      key: 'id',
      dataIndex: 'id',
      width: '10%',
      align: 'center',
      render: (value: string, record) => {
        const searchParams = new URLSearchParams();
        searchParams.set(SearchParamsKey.RPC, encodeURIComponent(network.provider.rpc));
        searchParams.set(SearchParamsKey.DESTINATION, destination);
        searchParams.set(SearchParamsKey.TAB, FeeMarketTab.OREDERS);
        searchParams.set(SearchParamsKey.ORDER, value.split('-')[1]);
        return (
          <div className="inline-flex items-center">
            {record.confirmedSlotIndex === null ? (
              <Badge status="processing" />
            ) : record.confirmedSlotIndex === -1 ? (
              <Badge status="warning" />
            ) : (
              <Badge status="success" />
            )}
            <NavLink to={`?${searchParams.toString()}`}>{value.split('-')[1]}</NavLink>
          </div>
        );
      },
    },
    {
      title: t(RelayerRole.DELIVERY),
      key: 'deliveredRelayersId',
      dataIndex: 'deliveredRelayersId',
      align: 'center',
      render: (value: string[] | null) =>
        value?.length ? (
          <IdentAccountName account={value[0]} />
        ) : (
          <div className="flex justify-center">
            <span>-</span>
          </div>
        ),
    },
    {
      title: t(RelayerRole.CONFIRMATION),
      key: 'confirmedRelayersId',
      dataIndex: 'confirmedRelayersId',
      align: 'center',
      render: (value: string[] | null) =>
        value?.length ? (
          <IdentAccountName account={value[0]} />
        ) : (
          <div className="flex justify-center">
            <span>-</span>
          </div>
        ),
    },
    {
      title: t('Created At'),
      key: 'createBlockNumber',
      dataIndex: 'createBlockNumber',
      align: 'center',
      render: (value: number, record) => (
        <div className="flex flex-col justify-center">
          <SubscanLink network={network.name} block={value.toString()} prefix="#" />
          <span>{format(new Date(`${record.createBlockTime}Z`), DATE_TIME_FORMATE)} (+UTC)</span>
        </div>
      ),
    },
    {
      title: t('Confirmed At'),
      key: 'finishBlockNumber',
      dataIndex: 'finishBlockNumber',
      align: 'center',
      render: (value: number | null, record) =>
        value ? (
          <div className="flex flex-col justify-center">
            <SubscanLink network={network.name} block={value.toString()} prefix="#" />
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
        setDataSource(dataSourceRef.current.filter((item) => item.id.split('-')[2] === search.value));
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

          const createTime = moment(item.createBlockTime.split('T')[0]);
          const finishTime = item.finishBlockTime ? moment(item.finishBlockTime.split('T')[0]) : null;

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
            (block.start ? block.start <= item.createBlockNumber : true) &&
            (block.end && item.finishBlockNumber ? item.finishBlockNumber <= block.end : true)
          )
        ) {
          return false;
        }

        switch (status) {
          // case FilterStatus.ALL:
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
          // case FilterSlot.ALL:
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
    dataSourceRef.current = ordersOverviewData?.orders?.nodes || [];
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
            value={ordersStatisticsData?.market?.inProgressInSlotOrders || 0}
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
            value={ordersStatisticsData?.market?.inProgressOutOfSlotOrders || 0}
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
            inSlot={ordersStatisticsData?.market?.inProgressInSlotOrders || 0}
            outOfSlot={ordersStatisticsData?.market?.inProgressOutOfSlotOrders || 0}
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
        <Table columns={columns} dataSource={dataSource} rowKey="orderId" loading={ordersOverviewLoading} />
      </Card>
    </>
  );
};
