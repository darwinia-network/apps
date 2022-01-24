import { Progress, Table } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DATE_FORMAT } from '../../config';
import { useApi } from '../../hooks';
import { AccountRecord } from '../../model';
import { fromWei, prettyNumber } from '../../utils';
import { SubscanLink } from '../widget/SubscanLink';
import { useStakingRecords } from './stakingRecords';

const calcProgress = (start: number, expire: number, bestNumber: number): number => {
  if (!bestNumber) {
    return 0;
  }

  if (bestNumber < start) {
    return 0;
  }

  if (expire <= bestNumber) {
    return 100;
  } else {
    const decimals = 2;

    return parseFloat((100 - ((expire - bestNumber) / (expire - start)) * 100).toFixed(decimals));
  }
};

export function Unbond() {
  const { t } = useTranslation();
  const { network, api } = useApi();
  const { pagination, setPagination, stakingRecord } = useStakingRecords('unbonding');
  const [bestNumber, setBestNumber] = useState<number>(0);

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
      title: 'Progress',
      key: 'progress',
      render(_, record) {
        const height = parseInt(record.extrinsic_index.split('-')[0], 10);
        return (
          <div className="px-4">
            <div className="flex justify-between items-center">
              <span>{format(new Date(record.start_at), DATE_FORMAT)}</span>
              <span className="mx-2">-</span>
              <span>{format(new Date(record.expired_at), DATE_FORMAT)}</span>
            </div>
            {bestNumber && <Progress percent={calcProgress(height, record.unbonding_block_end, bestNumber)} />}
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
      title: 'status',
      dataIndex: 'status',
      render: (_, record) => {
        return <span>{record.unbonding_block_end > bestNumber ? t('Unbonding') : t('Unbonded')}</span>;
      },
    },
  ];

  useEffect(() => {
    api.derive.chain.bestNumber().then((res) => {
      setBestNumber(res.toJSON());
    });
  }, [api]);

  return (
    <Table
      rowKey={'Id'}
      columns={columns}
      pagination={{ ...pagination, total: stakingRecord.count }}
      dataSource={stakingRecord.list ?? undefined}
      onChange={({ pageSize = 0, current = 0 }) => {
        setPagination({ ...pagination, pageSize, current });
      }}
    />
  );
}
