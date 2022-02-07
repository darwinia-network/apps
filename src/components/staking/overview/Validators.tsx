import { MailOutlined, StarOutlined } from '@ant-design/icons';
import { DeriveStakingOverview } from '@polkadot/api-derive/staking/types';
import { DeriveHeartbeats } from '@polkadot/api-derive/types';
import Identicon from '@polkadot/react-identicon';
import { Card, Col, Collapse, Input, Row, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from, switchMap, timer } from 'rxjs';
import { MIDDLE_DURATION } from '../../../config';
import { useApi, useIsMountedOperator } from '../../../hooks';
import { STAKING_FAV_KEY, useFavorites } from '../../../hooks/favorites';
import { AccountName } from '../../widget/AccountName';
import { HidablePanel } from './HidablePanel';

type AccountExtend = [string, boolean, boolean];

interface Filtered {
  elected: AccountExtend[];
  validators: AccountExtend[];
  waiting: AccountExtend[];
}

interface ValidatorsProps {
  overview: DeriveStakingOverview;
}

function filterAccounts(
  accounts: string[] = [],
  elected: string[],
  favorites: string[],
  without: string[]
): AccountExtend[] {
  return accounts
    .filter((accountId): boolean => !without.includes(accountId))
    .map((accountId): AccountExtend => [accountId, elected.includes(accountId), favorites.includes(accountId)])
    .sort(([, , isFavA]: AccountExtend, [, , isFavB]: AccountExtend): number =>
      isFavA === isFavB ? 0 : isFavA ? -1 : 1
    );
}

function getFiltered(stakingOverview: DeriveStakingOverview, favorites: string[], next?: string[]): Filtered {
  const allElected = stakingOverview.nextElected.map((item) => item.toString());
  const validatorIds = stakingOverview.validators.map((item) => item.toString());
  const validators = filterAccounts(validatorIds, allElected, favorites, []);
  const elected = filterAccounts(allElected, allElected, favorites, validatorIds);
  const waiting = filterAccounts(next, [], favorites, allElected);

  return {
    elected,
    validators,
    waiting,
  };
}

export function Validators({ overview }: ValidatorsProps) {
  const { t } = useTranslation();
  const {
    api,
    connection: { accounts },
  } = useApi();
  const [sourceData, setSourceData] = useState<AccountExtend[]>([]);
  const [favorites] = useFavorites(STAKING_FAV_KEY);
  const [online, setOnline] = useState<DeriveHeartbeats | null>();
  const [searchName, setSearchName] = useState('');
  const { takeWhileIsMounted } = useIsMountedOperator();

  useEffect(() => {
    if (!overview) {
      return;
    }

    const validators = overview.validators.map((item) => item.toString());
    const data = getFiltered(
      overview,
      favorites,
      accounts.map((item) => item.address).filter((item) => validators.includes(item))
    );

    setSourceData(data.validators);
  }, [accounts, favorites, overview]);

  useEffect(() => {
    const sub$$ = timer(0, MIDDLE_DURATION)
      .pipe(
        switchMap((_) => from(api.derive.imOnline.receivedHeartbeats())),
        takeWhileIsMounted()
      )
      .subscribe((res) => {
        setOnline(res);
      });

    return () => sub$$.unsubscribe();
  }, [api, takeWhileIsMounted]);

  return (
    <>
      <Input
        onChange={(event) => {
          setSearchName(event.target.value);
        }}
        size="large"
        placeholder={t('Flite by name, address or index')}
        className="my-8 w-1/3"
      />

      <Card>
        <Row justify="space-between" className="py-4 pl-8 pr-4 font-bold bg-gray-200 rounded-t-lg">
          <Col span={10}>{t('Validator')}</Col>
          <Col span={10}>
            <Row justify="space-between">
              <Col>{t('other stake(power)')}</Col>
              <Col>{t('own stake(power)')}</Col>
              <Col>{t('active commission')}</Col>
              <Col>{t('next commission')}</Col>
              <Col>{t('points')}</Col>
              <Col>{t('last #')}</Col>
            </Row>
          </Col>
          <Col></Col>
        </Row>

        <Collapse style={{ borderRadius: '0 0 10px 10px' }}>
          {sourceData.map(([account]) => {
            const count = online?.[account]?.blockCount.toNumber();
            const hasMsg = online?.[account]?.hasMessage;

            return (
              <HidablePanel
                showArrow={false}
                account={account}
                match={searchName}
                header={
                  <span className="flex items-center gap-4 ml-4 ">
                    <StarOutlined />

                    <div className="w-8">
                      {!!count && <Tag color="cyan">{count}</Tag>}
                      {!count && hasMsg && <MailOutlined color="cyan" />}
                    </div>

                    <span className="inline-flex items-center gap-2">
                      <Identicon value={account} size={32} className="rounded-full border p-1" />
                      <AccountName account={account} />
                    </span>
                  </span>
                }
                key={account}
              ></HidablePanel>
            );
          })}
        </Collapse>
      </Card>
    </>
  );
}
