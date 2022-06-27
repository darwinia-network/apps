import type { BlockNumber } from '@polkadot/types/interfaces';
import type { u64 } from '@polkadot/types';
import type { ColumnsType } from 'antd/lib/table';
import { useCallback, useEffect, useState } from 'react';
import { Button, Table } from 'antd';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { forkJoin, from } from 'rxjs';

import { useApi, useAccount, useQueue, useStaking, useSlashingSpans, useBlockTime } from '../../hooks';
import { UnbondType, UnbondDataSourceState } from '../staking/interface';
import { fromWei, prettyNumber } from '../../utils';
import { DATE_FORMAT } from '../../config';

type CurrentBlockTime = { block: number; time: number };

const calcuUntil = (until: BlockNumber, current: CurrentBlockTime | undefined, period: number) => {
  if (current && period) {
    return format(new Date((until.toNumber() - current.block) * period + current.time), DATE_FORMAT);
  } else {
    return `#${until.toNumber()}`;
  }
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
      title: 'Until',
      key: 'until',
      dataIndex: 'until',
      align: 'center',
      render: (value: BlockNumber) => <span>{calcuUntil(value, currentBlockTime, blockTime)}</span>,
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      align: 'center',
      render: (value: UnbondType) =>
        value === UnbondType.UNBONDED ? (
          <div className="flex justify-center">
            <Button onClick={handleWithdraw} className="p-0 flex items-center justify-center w-28">
              {t('Withdraw')}
            </Button>
          </div>
        ) : (
          '-'
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
