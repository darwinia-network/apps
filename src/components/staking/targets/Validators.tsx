import { ExposureT, Power } from '@darwinia/types';
import { DeriveStakingWaiting } from '@polkadot/api-derive/types';
import { Button, Card, Input, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import BN from 'bn.js';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IDeriveStakingElected } from '../../../api-derive';
import { useIsAccountFuzzyMatch } from '../../../hooks';
import { prettyNumber } from '../../../utils';
import { IdentAccountName } from '../../widget/account/IdentAccountName';
import { Favorite } from '../../widget/Favorite';
import { MaxBadge } from './MaxBadge';

interface ValidatorsProps {
  data: { elected: IDeriveStakingElected; waiting: DeriveStakingWaiting };
}

interface RowData {
  account: string;
  nominatorCount: number;
  currentEraCommissionPer: number;
  commissionPer: number;
  bondedTotal: Power;
  bondedOwn: Power;
}

const toPercent = (value: number) => {
  const decimal = 2;

  return value.toFixed(decimal) + '%';
};

export function Validators({ data }: ValidatorsProps) {
  const { t } = useTranslation();
  const isMatch = useIsAccountFuzzyMatch();
  const [searchName, setSearchName] = useState('');

  const rowData = useMemo<RowData[]>(() => {
    const { elected, waiting } = data;
    const billion = 10_000_000;

    return [...elected.info, ...waiting.info].map(({ accountId, exposure, validatorPrefs }, index) => ({
      account: accountId.toString(),
      nominatorCount: exposure.others.length,
      currentEraCommissionPer:
        (elected.activeCommissions[index]?.commission?.unwrap() || new BN(0)).toNumber() / billion,
      commissionPer: validatorPrefs.commission.unwrap().toNumber() / billion,
      bondedTotal: (exposure as unknown as ExposureT).totalPower,
      bondedOwn: (exposure as unknown as ExposureT).ownPower,
    }));
  }, [data]);

  const sourceData = useMemo(
    () => rowData.filter(({ account }) => isMatch(account, searchName)),
    [isMatch, rowData, searchName]
  );

  const columns: ColumnsType<RowData> = [
    {
      title: t('Validator'),
      dataIndex: 'account',
      render(account, record) {
        return (
          <div className="flex items-center gap-2">
            <Favorite account={account} className="flex items-center" />
            <MaxBadge nominatorCount={record.nominatorCount} className="mx-2" />
            {/* TODO: rank overall: index after sorted */}
            <IdentAccountName account={account} iconSize={24} />
          </div>
        );
      },
    },
    {
      title: t('active commission'),
      dataIndex: 'currentEraCommissionPer',
      render: toPercent,
    },
    {
      title: t('next commission'),
      dataIndex: 'commissionPer',
      render: toPercent,
    },
    {
      title: t('total stake(power)'),
      dataIndex: 'bondedTotal',
      render: (value) => prettyNumber(value),
    },
    {
      title: t('own stake(power)'),
      dataIndex: 'bondedOwn',
      render: (value) => prettyNumber(value),
    },
    {
      title: t('other stake(power)'),
      key: 'boundedOther',
      render(_, record) {
        return (
          <span>
            {prettyNumber(record.bondedTotal.sub(record.bondedOwn))} ({record.nominatorCount})
          </span>
        );
      },
    },
  ];

  console.log('%c [ searchName ]-16', 'font-size:13px; background:pink; color:#bf2c9f;', searchName, data);

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
        <Button type="primary">{t('Nominate selected')}</Button>
      </div>

      <Card>
        <Table rowKey="account" dataSource={sourceData} columns={columns} pagination={false} />
      </Card>
    </>
  );
}
