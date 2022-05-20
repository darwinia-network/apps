import { Progress, Table } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from } from 'rxjs';
import { DATE_FORMAT, STAKING_RECORD_PAGE_SIZE, DARWINIA_UNBONDING_PERIOD } from '../../config';
import { useApi, useStakingRecords, useAccount } from '../../hooks';
import { StakingRecord, StakingType } from '../../model';
import { fromWei, prettyNumber } from '../../utils';
import { SubscanLink } from '../widget/SubscanLink';

const calcProgress = (start: number, expire: number, chainTime: number): number => {
  if (chainTime < start) {
    return 0;
  }

  if (expire <= chainTime) {
    return 100;
  } else {
    const decimals = 2;
    return parseFloat((100 - ((expire - chainTime) / (expire - start)) * 100).toFixed(decimals));
  }
};

export function UnbondRecords() {
  const { t } = useTranslation();
  const { account } = useAccount();
  const { network, api } = useApi();
  const [chainTime, setChainTime] = useState<number>();
  const [current, setCurrent] = useState(1);
  const { loading, data } = useStakingRecords({
    first: STAKING_RECORD_PAGE_SIZE,
    offset: (current - 1) * STAKING_RECORD_PAGE_SIZE,
    account,
    types: [StakingType.Unbond],
  });

  const columns: ColumnType<StakingRecord>[] = [
    {
      title: 'No.',
      key: 'index',
      width: '5%',
      align: 'center',
      render: (_1, _2, index) => index + 1,
    },
    {
      title: 'Extrinsic ID',
      dataIndex: 'extrinsicIndex',
      align: 'center',
      render: (_, { blockNumber, extrinsicIndex }) => {
        return (
          <SubscanLink network={network.name} extrinsic={{ height: blockNumber, index: extrinsicIndex }}>
            {`${blockNumber}-${extrinsicIndex}`}
          </SubscanLink>
        );
      },
    },
    {
      title: 'Progress',
      key: 'progress',
      width: '15%',
      align: 'center',
      render(_, { blockTime }) {
        const start = Number(blockTime);
        const expired = start + DARWINIA_UNBONDING_PERIOD;

        return (
          <div className="px-4">
            <div className="flex justify-between items-center">
              <span>{format(new Date(start), DATE_FORMAT)}</span>
              <span className="mx-2">-</span>
              <span>{format(new Date(expired), DATE_FORMAT)}</span>
            </div>
            {chainTime && (
              <Progress
                percent={calcProgress(start, expired, chainTime)}
                showInfo={false}
                status="normal"
                strokeWidth={4}
                trailColor="#EBEBEB"
              />
            )}
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
      title: 'status',
      dataIndex: 'status',
      align: 'center',
      width: '20%',
      render: (_, { blockTime }) => {
        const expired = Number(blockTime) + DARWINIA_UNBONDING_PERIOD;

        return <span>{expired > (chainTime ?? 0) ? t('Unbonding') : t('Unbonded')}</span>;
      },
    },
  ];

  useEffect(() => {
    const sub$$ = from<Promise<number>>(api.query.timestamp.now()).subscribe(setChainTime);
    return () => sub$$.unsubscribe();
  }, [api.query.timestamp]);

  return (
    <Table
      rowKey={'id'}
      columns={columns}
      loading={loading}
      pagination={{
        pageSize: DARWINIA_UNBONDING_PERIOD,
        current,
        total: data?.stakingRecordEntities.totalCount,
        onChange: (page) => setCurrent(page),
      }}
      dataSource={data?.stakingRecordEntities.nodes}
      className="whitespace-nowrap"
    />
  );
}
