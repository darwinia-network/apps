import { AppstoreOutlined, LineChartOutlined, MailOutlined } from '@ant-design/icons';
import { Power } from '@darwinia/types';
import { DeriveStakingOverview } from '@polkadot/api-derive/staking/types';
import { DeriveHeartbeats } from '@polkadot/api-derive/types';
import Identicon from '@polkadot/react-identicon';
import { BN_ZERO } from '@polkadot/util';
import { Card, Col, Collapse, Input, Row, Tag } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from, switchMap, timer } from 'rxjs';
import { MIDDLE_DURATION } from '../../../config';
import { useApi, useIsMountedOperator } from '../../../hooks';
import { STAKING_FAV_KEY, useFavorites } from '../../../hooks/favorites';
import { prettyNumber } from '../../../utils';
import { AccountName } from '../../widget/AccountName';
import { Favorite } from '../../widget/Favorite';
import { PrettyAccount } from '../../widget/PrettyAccount';
import { HidablePanel } from './HidablePanel';
import { OverviewProvider, useOverview } from './overview';

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

function StakerOther() {
  const { stakingInfo } = useOverview();

  const count = useMemo(() => {
    const { exposure } = stakingInfo;
    const other = exposure?.totalPower.sub(exposure.ownPower);

    return other || BN_ZERO;
  }, [stakingInfo]);

  const nominators = useMemo(() => stakingInfo.exposure?.others.map((item) => item.who.toString()), [stakingInfo]);

  if (count?.lte(BN_ZERO)) {
    return null;
  }

  return (
    <span>
      {prettyNumber(count)} {`(${nominators?.length})`}
    </span>
  );
}

function Nominators() {
  const { stakingInfo } = useOverview();
  const nominators = useMemo<[string, Power][]>(
    () => stakingInfo.exposure?.others.map((item) => [item.who.toString(), item.power]) || [],
    [stakingInfo]
  );

  return (
    <span className="grid grid-cols-4 items-center gap-4 bg-white p-4 rounded-lg">
      {nominators?.map(([acc]) => (
        <PrettyAccount key={acc} account={{ address: acc }} iconSize={24} />
      ))}
    </span>
  );
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
        <Row justify="space-between" align="middle" className="p-4 font-bold bg-gray-200 rounded-t-lg">
          <Col span={8} className="pl-8">
            {t('Validator')}
          </Col>
          <Col className="flex-1">
            <Row align="middle" justify="space-around">
              <Col span={3} className="text-center">
                {t('other stake(power)')}
              </Col>
              <Col span={3} className="text-center">
                {t('own stake(power)')}
              </Col>
              <Col span={3} className="text-center">
                {t('active commission')}
              </Col>
              <Col span={3} className="text-center">
                {t('next commission')}
              </Col>
              <Col span={3} className="text-center">
                {t('points')}
              </Col>
              <Col span={3} className="text-center">
                {t('last #')}
              </Col>
              <Col span={2}></Col>
            </Row>
          </Col>
        </Row>

        <div className="border-l border-r rounded-b-lg">
          {sourceData.map(([account], index) => {
            const count = online?.[account]?.blockCount.toNumber();
            const hasMsg = online?.[account]?.hasMessage;

            return (
              <OverviewProvider key={account} account={account}>
                <Collapse bordered={false} className="rounded-none">
                  <HidablePanel
                    showArrow={false}
                    account={account}
                    match={searchName}
                    style={{ borderRadius: index === sourceData.length - 1 ? '0 0 10px 10px' : '0' }}
                    header={
                      <Row align="middle" justify="space-between">
                        <Col
                          span={8}
                          onClick={(event) => event.stopPropagation()}
                          className="flex items-center gap-4 pl-4"
                        >
                          <Favorite account={account} />

                          <div className="w-8">
                            {!!count && <Tag color="cyan">{count}</Tag>}
                            {!count && hasMsg && <MailOutlined color="cyan" />}
                          </div>

                          <span className="inline-flex items-center gap-2">
                            <Identicon value={account} size={32} className="rounded-full border p-1" />
                            <AccountName account={account} />
                          </span>
                        </Col>
                        <Col className="flex-1">
                          <Row justify="space-around" align="middle">
                            <Col span={3} className="text-center">
                              <StakerOther />
                            </Col>
                            <Col span={3} className="text-center">
                              xx
                            </Col>
                            <Col span={3} className="text-center">
                              xx
                            </Col>
                            <Col span={3} className="text-center">
                              xx
                            </Col>
                            <Col span={3} className="text-center">
                              xx
                            </Col>
                            <Col span={3} className="text-center">
                              xx
                            </Col>
                            <Col span={2} className="flex justify-end items-center gap-8">
                              <LineChartOutlined />
                              <AppstoreOutlined />
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    }
                    key={account}
                  >
                    <Nominators />
                  </HidablePanel>
                </Collapse>
              </OverviewProvider>
            );
          })}
        </div>
      </Card>
    </>
  );
}
