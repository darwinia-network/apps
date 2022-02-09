import { LineChartOutlined } from '@ant-design/icons';
import { ExposureT, Power } from '@darwinia/types';
import { DeriveAccountInfo, DeriveStakingWaiting } from '@polkadot/api-derive/types';
import { ValidatorPrefs, ValidatorPrefsTo196 } from '@polkadot/types/interfaces';
import { Card, Input, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import BN from 'bn.js';
import { Reducer, useEffect, useMemo, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from, map, mergeMap, reduce } from 'rxjs';
import { IDeriveStakingElected } from '../../../api-derive';
import { useApi, useIsAccountFuzzyMatch, useIsMountedOperator } from '../../../hooks';
import { STAKING_FAV_KEY, useFavorites } from '../../../hooks/favorites';
import { prettyNumber } from '../../../utils';
import { IdentAccountName } from '../../widget/account/IdentAccountName';
import { Favorite } from '../../widget/Favorite';
import { Nominate } from '../action';
import { MaxBadge } from './MaxBadge';

interface ValidatorsProps {
  data: { elected: IDeriveStakingElected; waiting: DeriveStakingWaiting };
  lastReward: BN;
}

interface ValidatorInfoRank {
  rankBondOther: number;
  rankBondOwn: number;
  rankBondTotal: number;
  rankComm: number;
  rankActiveComm: number;
  rankOverall: number;
  rankPayment: number;
  rankReward: number;
}

interface ValidatorInfo extends ValidatorInfoRank {
  id: string;
  accountInfo: DeriveAccountInfo;
  account: string;
  nominatorCount: number;
  currentEraCommissionPer: number;
  commissionPer: number;
  bondedTotal: Power;
  bondedOwn: Power;
  validatorPayment: BN;
  rewardSplit: BN;
  rewardPayout: BN;
  // isFavorite: boolean;
}

const toPercent = (value: number) => {
  const decimal = 2;

  return value.toFixed(decimal) + '%';
};

function mapIndex(mapBy: keyof ValidatorInfoRank): (info: ValidatorInfo, index: number) => ValidatorInfo {
  return (info, index): ValidatorInfo => {
    info[mapBy] = index + 1;

    return info;
  };
}

function sortValidators(list: ValidatorInfo[]): ValidatorInfo[] {
  return (
    list
      // .filter((a) => a.bondTotal.gtn(0))
      .sort((a, b) => b.commissionPer - a.commissionPer)
      .map(mapIndex('rankComm'))
      .sort((a, b) => b.currentEraCommissionPer - a.currentEraCommissionPer)
      .map(mapIndex('rankActiveComm'))
      .sort((a, b) => b.bondedTotal.sub(b.bondedOwn).cmp(a.bondedTotal.sub(a.bondedOwn)))
      .map(mapIndex('rankBondOther'))
      .sort((a, b) => b.bondedOwn.cmp(a.bondedOwn))
      .map(mapIndex('rankBondOwn'))
      .sort((a, b) => b.bondedTotal.cmp(a.bondedTotal))
      .map(mapIndex('rankBondTotal'))
      .sort((a, b) => b.validatorPayment.cmp(a.validatorPayment))
      .map(mapIndex('rankPayment'))
      .sort((a, b) => a.rewardSplit.cmp(b.rewardSplit))
      .map(mapIndex('rankReward'))
      .sort((a, b): number => {
        const cmp = b.rewardPayout.cmp(a.rewardPayout);

        return cmp !== 0
          ? cmp
          : a.rankReward === b.rankReward
          ? a.rankPayment === b.rankPayment
            ? b.rankBondTotal - a.rankBondTotal
            : b.rankPayment - a.rankPayment
          : b.rankReward - a.rankReward;
      })
      .map(mapIndex('rankOverall'))
  );
}

export function Validators({ data, lastReward }: ValidatorsProps) {
  const { t } = useTranslation();
  const { api } = useApi();
  const [favorites] = useFavorites(STAKING_FAV_KEY);
  const isMatch = useIsAccountFuzzyMatch();
  const [searchName, setSearchName] = useState('');
  const [rowData, setRowData] = useReducer<Reducer<ValidatorInfo[], ValidatorInfo[]>>((_, payload) => payload, []);
  const { takeWhileIsMounted } = useIsMountedOperator();
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  const sourceData = useMemo(
    () =>
      rowData
        .filter(({ account, accountInfo }) => isMatch(account, searchName, accountInfo))
        .sort((a, b) => {
          const isFavA = favorites.includes(a.account);
          const isFavB = favorites.includes(b.account);

          return isFavA === isFavB ? 0 : isFavA ? -1 : 1;
        }),
    [favorites, isMatch, rowData, searchName]
  );

  const columns: ColumnsType<ValidatorInfo> = [
    {
      title: t('Validator'),
      dataIndex: 'account',
      render(account, record) {
        return (
          <div className="flex items-center gap-2">
            <Favorite account={account} className="flex items-center" />
            <MaxBadge nominatorCount={record.nominatorCount} className="mx-2" />
            <span>{prettyNumber(record.rankOverall)}</span>
            <IdentAccountName account={account} iconSize={24} />
          </div>
        );
      },
    },
    {
      title: t('active commission'),
      dataIndex: 'currentEraCommissionPer',
      sortDirections: ['descend'],
      sorter(a, b) {
        return a.currentEraCommissionPer - b.currentEraCommissionPer;
      },
      render: toPercent,
    },
    {
      title: t('next commission'),
      dataIndex: 'commissionPer',
      sortDirections: ['descend'],
      sorter(a, b) {
        return a.commissionPer - b.commissionPer;
      },
      render: toPercent,
    },
    {
      title: t('total stake(power)'),
      dataIndex: 'bondedTotal',
      sortDirections: ['descend'],
      sorter(a, b) {
        return a.bondedTotal.sub(b.bondedTotal).toNumber();
      },
      render: (value) => prettyNumber(value),
    },
    {
      title: t('own stake(power)'),
      dataIndex: 'bondedOwn',
      sortDirections: ['descend'],
      sorter(a, b) {
        return a.bondedOwn.sub(b.bondedOwn).toNumber();
      },
      render: (value) => prettyNumber(value),
    },
    {
      title: t('other stake(power)'),
      key: 'boundedOther',
      sortDirections: ['descend'],
      sorter(a, b) {
        return a.bondedTotal.sub(a.bondedOwn).sub(b.bondedTotal.sub(b.bondedOwn)).toNumber();
      },
      render(_, record) {
        return (
          <span>
            {prettyNumber(record.bondedTotal.sub(record.bondedOwn))} ({record.nominatorCount})
          </span>
        );
      },
    },
    {
      key: 'action',
      render() {
        return <LineChartOutlined disabled />;
      },
    },
  ];

  useEffect(() => {
    const { elected, waiting } = data;
    const billion = 10_000_000;
    const amount = new BN('1000000000000'); // TODO: In old version:  new BN('1'.padEnd(formatBalance.getDefaults().decimals + 4, '0')); formatBalance.getDefaults().decimals = 9
    const sub$$ = from([...elected.info, ...waiting.info])
      .pipe(
        mergeMap(({ accountId, exposure, validatorPrefs }, index) =>
          from(api.derive.accounts.info(accountId.toString())).pipe(
            map((accountInfo) => {
              const perValidatorReward = lastReward.divn(elected.info.length);
              const validatorPayment = (validatorPrefs as unknown as ValidatorPrefsTo196).validatorPayment
                ? ((validatorPrefs as unknown as ValidatorPrefsTo196).validatorPayment.unwrap() as BN)
                : (validatorPrefs as unknown as ValidatorPrefs).commission
                    .unwrap()
                    .mul(perValidatorReward)
                    .div(new BN(billion));
              const rewardSplit = perValidatorReward.sub(validatorPayment);
              const bondedTotal = (exposure as unknown as ExposureT).totalPower;
              const rewardPayout = rewardSplit.gtn(0)
                ? amount.mul(rewardSplit).div(amount.add(bondedTotal))
                : new BN(0);

              return {
                id: accountId.toString() + '-' + index,
                accountInfo,
                account: accountId.toString(),
                nominatorCount: exposure.others.length,
                currentEraCommissionPer:
                  (elected.activeCommissions[index]?.commission?.unwrap() || new BN(0)).toNumber() / billion,
                commissionPer: validatorPrefs.commission.unwrap().toNumber() / billion,
                bondedOwn: (exposure as unknown as ExposureT).ownPower,
                bondedTotal,
                rankBondOther: 0,
                rankBondOwn: 0,
                rankBondTotal: 0,
                rankComm: 0,
                rankActiveComm: 0,
                rankOverall: 0,
                rankPayment: 0,
                rankReward: 0,
                validatorPayment,
                rewardPayout,
                rewardSplit,
              };
            })
          )
        ),
        takeWhileIsMounted(),
        reduce((acc: ValidatorInfo[], cur: ValidatorInfo) => [...acc, cur], [])
      )
      .subscribe((res) => {
        setRowData(sortValidators(res));
      });

    return () => sub$$.unsubscribe();
  }, [api, data, lastReward, takeWhileIsMounted]);

  return (
    <>
      <div className="flex justify-between items-center">
        <Input
          onChange={(event) => {
            setSearchName(event.target.value);
          }}
          size="large"
          placeholder={t('Flite by name, address or index')}
          className="my-8 w-1/3"
        />

        <Nominate
          type="primary"
          label="Nominate selected"
          defaultSelects={selectedAccounts}
          disabled={!selectedAccounts.length}
        />
      </div>

      <Card>
        <Table
          rowKey="id"
          rowSelection={{
            type: 'checkbox',
            onChange: (keys) => {
              const accounts = keys.map((item) => (item as string).split('-')[0]);

              setSelectedAccounts(accounts);
            },
          }}
          dataSource={sourceData}
          columns={columns}
          pagination={false}
        />
      </Card>
    </>
  );
}
