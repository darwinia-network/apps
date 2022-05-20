import { Button, Checkbox, Modal, Progress, Table } from 'antd';
import { ColumnType } from 'antd/lib/table';
import BigNumber from 'bignumber.js';
import { format, getUnixTime } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StakingLedger } from '@polkadot/types/interfaces/staking';
import { from } from 'rxjs';
import { Option } from '@polkadot/types';
import { DATE_FORMAT, STAKING_RECORD_PAGE_SIZE } from '../../config';
import { useAccount, useApi, useQueue, useStakingRecords } from '../../hooks';
import { StakingType, StakingRecord } from '../../model';
import { fromWei, isKton, prettyNumber, ringToKton, calcMonths, processTime } from '../../utils';
import { AccountHistoryProps } from '../staking/interface';
import { SubscanLink } from '../widget/SubscanLink';
import { ViewBrowserIcon } from '../icons/view-browser';

const calcFine = (data: StakingRecord): string => {
  const { amount, startTime, expireTime } = data;
  const months = calcMonths(startTime, expireTime);

  const rewardOrigin = new BigNumber(ringToKton(amount, months));
  // eslint-disable-next-line no-magic-numbers
  const milliSecondsAs30DaysPerMonth = 30 * 24 * 3600 * 1000;
  const rewardMonth = Math.floor((new Date().getTime() - Number(startTime)) / milliSecondsAs30DaysPerMonth);
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
  const [forceUnlockTarget, setForceUnlockTarget] = useState<StakingRecord | null>(null);
  const kton = useMemo(() => tokens.find((item) => isKton(item?.symbol)), [tokens]);

  const [ledger, setLedger] = useState<StakingLedger | null>(null);
  const [current, setCurrent] = useState(1);
  const { loading, data, refetch } = useStakingRecords({
    first: STAKING_RECORD_PAGE_SIZE,
    offset: (current - 1) * STAKING_RECORD_PAGE_SIZE,
    account,
    types: [StakingType.Locked],
  });

  const refreshLedger = useCallback(() => {
    return from<Promise<Option<StakingLedger>>>(api.query.staking.ledger(account)).subscribe((value) => {
      setLedger(value.isSome ? value.unwrap() : null);
    });
  }, [api, account]);

  const forceUnlock = useCallback(() => {
    if (forceUnlockTarget) {
      const extrinsic = api.tx.staking.tryClaimDepositsWithPunish(Number(forceUnlockTarget.expireTime));
      queueExtrinsic({
        signAddress: account,
        extrinsic,
        txSuccessCb: () => {
          setForceUnlockTarget(null);
          refetch();
        },
      });
    }
  }, [account, api, forceUnlockTarget, queueExtrinsic, refetch]);

  useEffect(() => {
    const sub$$ = refreshLedger();
    return () => sub$$.unsubscribe();
  }, [refreshLedger]);

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
      title: 'Date',
      key: 'dateRange',
      width: '15%',
      align: 'center',
      render(_, { startTime, expireTime }) {
        const start = Number(startTime);
        const expired = Number(expireTime);

        return (
          <div className="px-4">
            <div className="flex justify-between items-center">
              <span>{format(new Date(start), DATE_FORMAT)}</span>
              <span className="mx-2">-</span>
              <span>{format(new Date(expired), DATE_FORMAT)}</span>
            </div>
            <Progress
              percent={processTime(start, expired)}
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
      title: 'Reward',
      key: 'reward',
      align: 'center',
      render: (_, { startTime, expireTime, amount }) => {
        const months = calcMonths(startTime, expireTime);
        const value = ringToKton(amount, months);

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
      align: 'center',
      width: '20%',
      render: (_, record) => {
        const {
          expireTime,
          isUnlockEarlier,
          earlierUnlockBlockTime,
          earlierUnlockBlockNumber,
          earlierUnlockExtrinsicIndex,
        } = record;
        const expired = Number(expireTime);

        if (isUnlockEarlier) {
          return (
            <div className="flex flex-col items-center">
              <span>{t('Lock limit canceled')}</span>
              <div className="inline-flex items-end space-x-1">
                (<span>{format(new Date(Number(earlierUnlockBlockTime)), DATE_FORMAT)}</span>
                <SubscanLink
                  network={network.name}
                  extrinsic={{ height: earlierUnlockBlockNumber, index: earlierUnlockExtrinsicIndex }}
                >
                  <ViewBrowserIcon />
                </SubscanLink>
                )
              </div>
            </div>
          );
        } else if (getUnixTime(expired) > getUnixTime(new Date())) {
          return (
            <Button
              onClick={() => setForceUnlockTarget(record)}
              className="p-0 flex items-center justify-center w-28 mx-auto"
            >
              {t('Unlock earlier')}
            </Button>
          );
        }

        if (getUnixTime(expired) <= getUnixTime(new Date())) {
          if ((ledger as unknown as { depositItems: unknown[] })?.depositItems.length) {
            return (
              <Button
                onClick={() => {
                  const extrinsic = api.tx.staking.claimMatureDeposits();
                  queueExtrinsic({
                    signAddress: account,
                    extrinsic,
                    txSuccessCb: () => {
                      refetch();
                      refreshLedger();
                    },
                  });
                }}
                className="p-0 flex items-center justify-center w-28 mx-auto"
              >
                {t('Release')}
              </Button>
            );
          } else {
            return t('Expired');
          }
        }
      },
    },
  ];

  return (
    <>
      <Checkbox checked={locked} onChange={() => setLocked(!locked)} className="hidden absolute right-4 top-8">
        {t('Only term deposit')}
      </Checkbox>
      <Table
        rowKey={'id'}
        columns={columns}
        loading={loading}
        pagination={{
          current,
          pageSize: STAKING_RECORD_PAGE_SIZE,
          total: data?.stakingRecordEntities.totalCount,
          onChange: (page) => setCurrent(page),
        }}
        dataSource={data?.stakingRecordEntities.nodes}
        className="whitespace-nowrap"
      />
      <Modal
        title={t('Confirm to continue')}
        visible={!!forceUnlockTarget}
        onCancel={() => setForceUnlockTarget(null)}
        footer={
          <div className="flex justify-center space-x-8">
            <Button className="w-20" onClick={() => setForceUnlockTarget(null)}>
              {t('Cancel')}
            </Button>
            <Button className="w-20" onClick={forceUnlock}>
              {t('OK')}
            </Button>
          </div>
        }
      >
        <p>
          {t(
            'Currently in lock-up period, you will be charged a penalty of 3 times the {{KTON}} reward. Are you sure to continue?',
            { KTON: kton?.symbol }
          )}
        </p>
        <p className="mt-2 font-bold">
          {t('Total Fines')}: {forceUnlockTarget ? calcFine(forceUnlockTarget) : '-'}
        </p>
      </Modal>
    </>
  );
}
