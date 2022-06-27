import type { BlockNumber } from '@polkadot/types/interfaces';
import type { u64 } from '@polkadot/types';
import type { ColumnsType } from 'antd/lib/table';
import { useCallback, useEffect, useState } from 'react';
import { Button, Table, Progress } from 'antd';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { forkJoin, from } from 'rxjs';

import { useApi, useAccount, useQueue, useStaking, useSlashingSpans, useBlockTime } from '../../hooks';
import { UnbondType, UnbondDataSourceState } from '../staking/interface';
import { fromWei, prettyNumber, processTime } from '../../utils';
import { DATE_FORMAT, FOURTEEN_DAYS_IN_MILLISECOND } from '../../config';
import { Rebond } from '../staking/action';

type CurrentBlockTime = { block: number; time: number };

const calcuStakingTime = (until: BlockNumber, current: CurrentBlockTime | undefined, period: number) => {
  let startTime = 0;
  let expireTime = 0;

  if (current && period) {
    expireTime = (until.toNumber() - current.block) * period + current.time;
    startTime = expireTime - FOURTEEN_DAYS_IN_MILLISECOND;
  }
  return { startTime, expireTime };
};

export const UnbondRecords = ({ dataSource }: { dataSource: UnbondDataSourceState[] }) => {
  const { api, network } = useApi();
  const { refreshAssets } = useAccount();
  const { queueExtrinsic } = useQueue();
  const [blockTime] = useBlockTime(1); // milliseconds
  const { controllerAccount, stashAccount, updateStakingDerive } = useStaking();
  const { spanCount } = useSlashingSpans(stashAccount);
  const { t } = useTranslation();
  const [currentBlockTime, setCurrentBlockTime] = useState<CurrentBlockTime>();

  const handleWithdraw = useCallback(() => {
    queueExtrinsic({
      signAddress: controllerAccount,
      extrinsic:
        api.tx.staking.withdrawUnbonded?.meta.args.length === 1
          ? api.tx.staking.withdrawUnbonded(spanCount)
          : api.tx.staking.withdrawUnbonded(),
      txSuccessCb: () => {
        refreshAssets();
        updateStakingDerive();
      },
    });
  }, [api, controllerAccount, spanCount, queueExtrinsic, refreshAssets, updateStakingDerive]);

  useEffect(() => {
    const sub$$ = forkJoin([api.rpc.chain.getHeader(), from(api.query.timestamp.now() as Promise<u64>)]).subscribe(
      ([header, now]) => {
        setCurrentBlockTime({
          block: header.number.toNumber(),
          time: now.toNumber(),
        });
      }
    );

    return () => sub$$.unsubscribe();
  }, [api]);

  const columns: ColumnsType<UnbondDataSourceState> = [
    {
      title: 'No.',
      key: 'index',
      dataIndex: 'index',
      width: '6%',
      align: 'center',
      render: (_1, _2, index) => index + 1,
    },
    {
      title: 'Amount',
      key: 'amount',
      dataIndex: 'amount',
      align: 'center',
      render: (value) => (
        <span>
          {fromWei({ value }, prettyNumber)} {network.tokens.ring.symbol}
        </span>
      ),
    },
    {
      title: 'Duration',
      key: 'until',
      dataIndex: 'until',
      align: 'center',
      width: '30%',
      render: (value: BlockNumber) => {
        const { startTime, expireTime } = calcuStakingTime(value, currentBlockTime, blockTime);

        return (
          <div className="px-4">
            <div className="flex justify-between items-center">
              <span>{format(new Date(startTime), DATE_FORMAT)}</span>
              <span className="mx-2">-</span>
              <span>{format(new Date(expireTime), DATE_FORMAT)}</span>
            </div>
            <Progress
              percent={processTime(startTime, expireTime)}
              showInfo={false}
              status="normal"
              strokeWidth={4}
              trailColor="#EBEBEB"
            />
          </div>
        );
      },
    },
    {
      title: 'Action',
      key: 'status',
      dataIndex: 'status',
      align: 'center',
      render: (value: UnbondType) => (
        <div className="flex justify-center">
          {value === UnbondType.UNBONDED ? (
            <Button onClick={handleWithdraw} className="p-0 flex items-center justify-center w-28">
              {t('Withdraw')}
            </Button>
          ) : (
            <Rebond type="default" className="p-0 flex items-center justify-center w-28" />
          )}
        </div>
      ),
    },
  ];

  return (
    <Table
      rowKey={(record) => `${record.amount.toString()}-${record.status}-${record.symbol}-${record.until.toString()}`}
      columns={columns}
      dataSource={dataSource}
      className="whitespace-nowrap"
    />
  );
};
