import { Table, Progress, Button, Modal } from 'antd';
import { format } from 'date-fns';
import { useState, useCallback, useEffect } from 'react';
import { BN, bnToBn, BN_ZERO } from '@polkadot/util';
import type { Balance } from '@polkadot/types/interfaces';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/lib/table';
import type { TsInMs } from '@darwinia/types';
import type { DarwiniaStakingStructsTimeDepositItem } from '@darwinia/api-derive/types';

import { useApi, useQueue, useStaking, useAssets, useAccount } from '../../hooks';
import { DATE_FORMAT, THIRTY_DAYS_IN_MILLISECOND } from '../../config';
import { fromWei, prettyNumber, computeKtonReward, processTime, isKton } from '../../utils';

enum LockStatus {
  LOCKING,
  EXPIRED,
}

interface DataSourceState {
  index: number;
  value: Balance;
  reward: BN;
  duration: {
    startTime: TsInMs;
    expireTime: TsInMs;
  };
  status: LockStatus;
}

// https://github.com/darwinia-network/darwinia-common/blob/main/frame/staking/src/lib.rs#L1548-L1553
const computeKtonPenalty = (record: DataSourceState): BN => {
  const {
    value,
    duration: { startTime, expireTime },
  } = record;

  const planMonths = expireTime.sub(startTime.toBn()).div(bnToBn(THIRTY_DAYS_IN_MILLISECOND)).toNumber();
  const passMonths = bnToBn(Date.now()).sub(startTime).div(bnToBn(THIRTY_DAYS_IN_MILLISECOND)).toNumber();

  // eslint-disable-next-line no-magic-numbers
  return computeKtonReward(value, planMonths).sub(computeKtonReward(value, passMonths)).muln(3);
};

export const LockedRecords = ({
  locks,
  loading,
}: {
  locks: DarwiniaStakingStructsTimeDepositItem[];
  loading: boolean;
}) => {
  const { api, network } = useApi();
  const { refreshAssets } = useAccount();
  const { queueExtrinsic } = useQueue();
  const { controllerAccount, stashAccount, updateStakingDerive } = useStaking();
  const { assets: stashAssets } = useAssets(stashAccount);
  const { t } = useTranslation();
  const [dataSource, setDataSource] = useState<DataSourceState[]>([]);

  const handleUnlockEarlier = useCallback(
    (record: DataSourceState) => {
      const extrinsic = api.tx.staking.tryClaimDepositsWithPunish(record.duration.expireTime);
      queueExtrinsic({
        signAddress: controllerAccount,
        extrinsic,
        txSuccessCb: () => {
          refreshAssets();
          updateStakingDerive();
        },
      });
    },
    [api, controllerAccount, queueExtrinsic, refreshAssets, updateStakingDerive]
  );

  useEffect(() => {
    setDataSource(
      locks.map((lock, index) => {
        const { value, startTime, expireTime } = lock;

        const months = expireTime
          .unwrap()
          .sub(startTime.unwrap().toBn())
          // eslint-disable-next-line no-magic-numbers
          .div(new BN(THIRTY_DAYS_IN_MILLISECOND))
          .toNumber();

        return {
          index,
          value: value.unwrap(),
          reward: computeKtonReward(value.unwrap(), months),
          duration: {
            startTime: lock.startTime.unwrap(),
            expireTime: lock.expireTime.unwrap(),
          },
          status: expireTime.unwrap().toNumber() < Date.now() ? LockStatus.EXPIRED : LockStatus.LOCKING,
        };
      })
    );
  }, [locks]);

  const columns: ColumnsType<DataSourceState> = [
    {
      title: 'No.',
      key: 'index',
      dataIndex: 'index',
      width: '6%',
      align: 'center',
      render: (value) => value + 1,
    },
    {
      title: 'Amount',
      key: 'value',
      dataIndex: 'value',
      align: 'center',
      render: (value) => (
        <span>
          {fromWei({ value }, prettyNumber)} {network.tokens.ring.symbol}
        </span>
      ),
    },
    {
      title: 'Duration',
      key: 'duration',
      dataIndex: 'duration',
      width: '30%',
      align: 'center',
      render: (value: { startTime: TsInMs; expireTime: TsInMs }) => (
        <div className="px-4">
          <div className="flex justify-between items-center">
            <span>{format(new Date(value.startTime.toNumber()), DATE_FORMAT)}</span>
            <span className="mx-2">-</span>
            <span>{format(new Date(value.expireTime.toNumber()), DATE_FORMAT)}</span>
          </div>
          <Progress
            percent={processTime(value.startTime.toNumber(), value.expireTime.toNumber())}
            showInfo={false}
            status="normal"
            strokeWidth={4}
            trailColor="#EBEBEB"
          />
        </div>
      ),
    },
    {
      title: 'Reward',
      key: 'reward',
      dataIndex: 'reward',
      align: 'center',
      render: (value) => (
        <span>
          {fromWei({ value }, prettyNumber)} {network.tokens.kton.symbol}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'status',
      dataIndex: 'status',
      align: 'center',
      render: (value: LockStatus, record: DataSourceState) => (
        <div className="flex justify-center">
          {value === LockStatus.LOCKING ? (
            <Button
              onClick={() => {
                const penalty = computeKtonPenalty(record);
                const isInsufficient = (stashAssets.find((asset) => isKton(asset.token.symbol))?.max || BN_ZERO).lt(
                  penalty
                );

                Modal.confirm({
                  title: t('Confirm to continue'),
                  onOk: () => handleUnlockEarlier(record),
                  content: (
                    <>
                      <p>
                        {t(
                          'Currently in lock-up period, you will be charged a penalty of 3 times the {{KTON}} reward. Are you sure to continue?',
                          { KTON: network.tokens.kton.symbol }
                        )}
                      </p>
                      <p className="mt-2 font-bold">
                        {t('Total Penalty')}: {fromWei({ value: penalty })}
                      </p>
                      {isInsufficient ? (
                        <span className="text-red-400 text-xs">
                          {t('Insufficient {{kton}} balance in stash account', { kton: network.tokens.kton.symbol })}
                        </span>
                      ) : null}
                    </>
                  ),
                  okButtonProps: {
                    disabled: isInsufficient,
                  },
                });
              }}
              className="p-0 flex items-center justify-center w-28"
            >
              {t('Unlock earlier')}
            </Button>
          ) : (
            <Button
              onClick={() => {
                const extrinsic = api.tx.staking.claimMatureDeposits();
                queueExtrinsic({
                  signAddress: controllerAccount,
                  extrinsic,
                  txSuccessCb: () => {
                    updateStakingDerive();
                  },
                });
              }}
              className="p-0 flex items-center justify-center w-28"
            >
              {t('Release')}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Table rowKey={'index'} columns={columns} dataSource={dataSource} loading={loading} className="whitespace-nowrap" />
  );
};
