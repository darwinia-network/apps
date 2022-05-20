import { Table } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { format } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DATE_FORMAT, STAKING_RECORD_PAGE_SIZE } from '../../config';
import { useAccount, useApi, useStakingRecords } from '../../hooks';
import { StakingType, StakingRecord } from '../../model';
import { fromWei, prettyNumber } from '../../utils';
import { SubscanLink } from '../widget/SubscanLink';

export function BondedRecords() {
  const { network } = useApi();
  const { account } = useAccount();
  const [current, setCurrent] = useState(1);
  const { loading, data } = useStakingRecords({
    first: STAKING_RECORD_PAGE_SIZE,
    offset: (current - 1) * STAKING_RECORD_PAGE_SIZE,
    account,
    types: [StakingType.Bonded],
  });
  const { t } = useTranslation();

  const columns: ColumnType<StakingRecord>[] = [
    {
      title: 'No.',
      key: 'index',
      align: 'center',
      width: '5%',
      render: (_1, _2, index) => index + 1,
    },
    {
      title: 'Extrinsic ID',
      dataIndex: 'extrinsicId',
      align: 'center',
      render: (_, record) => {
        const { blockNumber, extrinsicIndex } = record;

        return (
          <SubscanLink network={network.name} extrinsic={{ height: blockNumber, index: extrinsicIndex }}>
            {`${blockNumber}-${extrinsicIndex}`}
          </SubscanLink>
        );
      },
    },
    {
      title: 'Date',
      key: 'date',
      align: 'center',
      render(_, record) {
        const { startTime } = record;
        return (
          <div className="px-4">
            <span>{format(new Date(Number(startTime)), DATE_FORMAT)}</span>
          </div>
        );
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      align: 'center',
      render: (value, { tokenSymbol }) => {
        return (
          <span className="inline-flex items-center">
            <span>{fromWei({ value }, prettyNumber)}</span>
            <span className="uppercase ml-2">{tokenSymbol}</span>
          </span>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      align: 'center',
      render: () => t('Bonded'),
    },
  ];

  return (
    <Table
      rowKey={'id'}
      loading={loading}
      columns={columns}
      pagination={{
        current,
        pageSize: STAKING_RECORD_PAGE_SIZE,
        total: data?.stakingRecordEntities.totalCount,
        onChange: (page) => setCurrent(page),
      }}
      dataSource={data?.stakingRecordEntities.nodes}
      className="whitespace-nowrap"
    />
  );
}
