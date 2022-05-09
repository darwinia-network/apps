import { Button, Checkbox, Modal, Progress, Table } from 'antd';
import { ColumnType } from 'antd/lib/table';
import BigNumber from 'bignumber.js';
import { format, getUnixTime } from 'date-fns';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DATE_FORMAT } from '../../config';
import { useAccount, useApi, useQueue } from '../../hooks';
import { AccountRecord } from '../../model';
import { fromWei, isKton, prettyNumber, ringToKton } from '../../utils';
import { AccountHistoryProps } from '../staking/interface';
import { SubscanLink } from '../widget/SubscanLink';
import { processTime, useStakingRecords } from './stakingRecords';

const calcFine = (data: AccountRecord): string => {
  const { amount, month, start_at } = data;
  const rewardOrigin = new BigNumber(ringToKton(amount, month));
  // eslint-disable-next-line no-magic-numbers
  const milliSecondsAs30DaysPerMonth = 30 * 24 * 3600 * 1000;
  const rewardMonth = Math.floor((new Date().getTime() - start_at) / milliSecondsAs30DaysPerMonth);
  const rewardActual = new BigNumber(ringToKton(amount, rewardMonth));
  const times = 3;

  return fromWei({ value: rewardOrigin.minus(rewardActual).multipliedBy(times).toString() });
};

export function BondRecords({ tokens }: AccountHistoryProps) {
  const { t } = useTranslation();
  const { network, api } = useApi();
  const { account } = useAccount();
  const { queueExtrinsic } = useQueue();
  const [locked, setLocked] = useState<boolean>(false);
  const { pagination, setPagination, stakingRecord, refreshStakingRecords, updateStakingRecord } = useStakingRecords(
    'bonded',
    locked
  );
  const [forceUnbondTarget, setForceUnbondTarget] = useState<AccountRecord | null>(null);
  const kton = useMemo(() => tokens.find((item) => isKton(item?.symbol)), [tokens]);
  const forceUnbond = useCallback(() => {
    if (!forceUnbondTarget) {
      return;
    }

    const extrinsic = api.tx.staking.tryClaimDepositsWithPunish(forceUnbondTarget.expired_at);
    queueExtrinsic({
      signAddress: account,
      extrinsic,
      txSuccessCb: () => {
        setForceUnbondTarget(null);
        refreshStakingRecords().subscribe(updateStakingRecord);
      },
    });
  }, [account, api, forceUnbondTarget, queueExtrinsic, refreshStakingRecords, updateStakingRecord]);

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
            <Progress
              percent={processTime(record.start_at, record.expired_at)}
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

        return (
          <span>
            <span>{fromWei({ value }, prettyNumber)}</span>
            <span className="ml-2">{kton?.symbol}</span>
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
          return (
            <Button
              onClick={() => {
                const extrinsic = api.tx.staking.claimMatureDeposits();
                queueExtrinsic({
                  signAddress: account,
                  extrinsic,
                  txSuccessCb: () => {
                    refreshStakingRecords().subscribe(updateStakingRecord);
                  },
                });
              }}
              className="p-0 flex items-center justify-center w-28"
            >
              {t('Release')}
            </Button>
          );
        }

        if (record.unlock) {
          return t('Lock limit canceled');
        }

        return (
          <Button onClick={() => setForceUnbondTarget(record)} className="p-0 flex items-center justify-center w-28">
            {t('Unlock earlier')}
          </Button>
        );
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
        pagination={{ ...pagination, total: stakingRecord.count }}
        dataSource={stakingRecord.list ?? undefined}
        onChange={({ pageSize = 0, current = 0 }) => {
          setPagination({ ...pagination, pageSize, current });
        }}
        className="whitespace-nowrap"
      />
      <Modal
        title={t('Confirm to continue')}
        visible={!!forceUnbondTarget}
        onCancel={() => setForceUnbondTarget(null)}
        onOk={() => {
          forceUnbond();
        }}
      >
        <p>
          {t(
            'Currently in lock-up period, you will be charged a penalty of 3 times the {{KTON}} reward. Are you sure to continue?',
            { KTON: kton?.symbol }
          )}
        </p>
        <p className="mt-2 font-bold">
          {t('Total Fines')}: {forceUnbondTarget ? calcFine(forceUnbondTarget) : '-'}
        </p>
      </Modal>
    </>
  );
}
