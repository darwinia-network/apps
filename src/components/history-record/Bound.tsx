import { Button, Checkbox, Progress, Table } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { format, getUnixTime } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DATE_FORMAT } from '../../config';
import { useApi } from '../../hooks';
import { AccountRecord } from '../../model';
import { fromWei, isKton, prettyNumber } from '../../utils';
import { SubscanLink } from '../widget/SubscanLink';
import { AccountHistoryProps } from './interface';
import { processTime, ringToKton, useRecords } from './records';

export function Bound({ tokens }: AccountHistoryProps) {
  const { t } = useTranslation();
  const { network } = useApi();
  const [locked, setLocked] = useState<boolean>(false);
  const { pagination, setPagination, data } = useRecords('bonded', locked);

  const columns: ColumnType<AccountRecord>[] = [
    {
      title: 'No.',
      key: 'index',
      width: '5%',
      align: 'center',
      render: (_1, _2, index) => index + 1,
    },
    {
      title: 'Extrinsic ID',
      dataIndex: 'extrinsic_index',
      render: (value: string) => {
        const [height, index] = value.split('-');

        return (
          <SubscanLink network={network.name} extrinsic={{ height, index }}>
            {value}
          </SubscanLink>
        );
      },
    },
    {
      title: 'Date',
      key: 'date_range',
      width: '15%',
      render(_, record) {
        return (
          <div className="px-4">
            <div className="flex justify-between items-center">
              <span>{format(new Date(record.start_at), DATE_FORMAT)}</span>
              <span className="mx-2">-</span>
              <span>{format(new Date(record.expired_at), DATE_FORMAT)}</span>
            </div>
            <Progress percent={processTime(record.start_at, record.expired_at)} showInfo={false} />
          </div>
        );
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      render: (value, record) => {
        return (
          <span className="inline-flex items-center">
            <span>{fromWei({ value }, prettyNumber)}</span>
            <span className="uppercase ml-2">{record.currency}</span>
          </span>
        );
      },
    },
    {
      title: 'Reward',
      key: 'reward',
      render: (_, record) => {
        if (record.currency.toLowerCase().includes('kton') || record.month === 0) {
          return '--';
        }

        const value = ringToKton(record.amount, record.month);
        const target = tokens.find((item) => isKton(item?.symbol));

        return (
          <span>
            <span>{fromWei({ value }, prettyNumber)}</span>
            <span className="ml-2">{target?.symbol}</span>
          </span>
        );
      },
    },
    {
      title: 'status',
      dataIndex: 'status',
      render: (_, record) => {
        if (record.month === 0) {
          return t('Expired');
        }

        if (getUnixTime(record.expired_at) < getUnixTime(new Date()) && !record.unlock) {
          return <Button size="small">{t('Release')}</Button>;
        }

        if (record.unlock) {
          return t('Lock limit canceled');
        }

        return <Button>{t('Unlock earlier')}</Button>;
      },
    },
  ];

  return (
    <>
      <Checkbox checked={locked} onChange={() => setLocked(!locked)} className="absolute right-4 top-8">
        {t('Only term deposit')}
      </Checkbox>
      <Table
        rowKey={'Id'}
        columns={columns}
        pagination={{ ...pagination, total: data.count }}
        dataSource={data.list ?? undefined}
        onChange={({ pageSize = 0, current = 0 }) => {
          setPagination({ ...pagination, pageSize, current });
        }}
      />
    </>
  );
}
