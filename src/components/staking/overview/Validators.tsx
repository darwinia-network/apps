import { AppstoreOutlined } from '@ant-design/icons';
import { DeriveStakingOverview } from '@polkadot/api-derive/staking/types';
import { DeriveHeartbeats } from '@polkadot/api-derive/types';
import { EraRewardPoints } from '@polkadot/types/interfaces';
import { Card, Col, Collapse, Input, Row } from 'antd';
import { Reducer, useEffect, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from, switchMap, timer } from 'rxjs';
import { MIDDLE_DURATION } from '../../../config';
import { useApi, useIsMountedOperator, useStaking } from '../../../hooks';
import { STAKING_FAV_KEY, useFavorites } from '../../../hooks/favorites';
import { AccountWithClassifiedInfo, createClassifiedStakingOverview, prettyNumber } from '../../../utils';
import { ChartLink } from '../ChartLink';
import { HidablePanel } from '../HidablePanel';
import { OverviewProvider } from './overview';
import {
  Account,
  ActiveCommission,
  NextCommission,
  Nominators,
  Points,
  StakerOther,
  StakerOwn,
} from './overview-widgets';

interface ValidatorsProps {
  overview: DeriveStakingOverview;
}

export function Validators({ overview }: ValidatorsProps) {
  const { t } = useTranslation();
  const { api, network } = useApi();
  const { stashAccounts } = useStaking();
  const [sourceData, setSourceData] = useState<AccountWithClassifiedInfo[]>([]);
  const [favorites] = useFavorites(STAKING_FAV_KEY);
  const [heartbeats, setHeartbeats] = useState<DeriveHeartbeats | null>(null);
  const [points, setPoints] = useState<EraRewardPoints | null>(null);
  const [byAuthor, setByAuthor] = useReducer<Reducer<Record<string, string>, Record<string, string>>>(
    (state, action) => ({ ...state, ...action }),
    {}
  );
  const [searchName, setSearchName] = useState('');
  const { takeWhileIsMounted } = useIsMountedOperator();

  useEffect(() => {
    const validators = overview.validators.map((item) => item.toString());
    const data = createClassifiedStakingOverview(
      overview,
      favorites,
      stashAccounts.filter((item) => !validators.includes(item))
    );

    setSourceData(data.validators);
  }, [stashAccounts, favorites, overview]);

  useEffect(() => {
    const heart$$ = timer(0, MIDDLE_DURATION)
      .pipe(
        switchMap((_) => from(api.derive.imOnline.receivedHeartbeats())),
        takeWhileIsMounted()
      )
      .subscribe((res) => {
        setHeartbeats(res);
      });

    const points$$ = from(api.derive.staking.currentPoints())
      .pipe(takeWhileIsMounted())
      .subscribe((res) => setPoints(res));

    const header$$ = timer(0, MIDDLE_DURATION)
      .pipe(
        switchMap((_) => from(api.derive.chain.subscribeNewHeads())),
        takeWhileIsMounted()
      )
      .subscribe((lastHeader) => {
        if (lastHeader?.number && lastHeader?.author) {
          const blockNumber = prettyNumber(lastHeader.number.unwrap());
          const author = lastHeader.author.toString();

          setByAuthor({ [author]: blockNumber });
        }
      });

    return () => {
      heart$$.unsubscribe();
      points$$.unsubscribe();
      header$$.unsubscribe();
    };
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
        <Row
          justify="space-between"
          align="middle"
          className="p-4 font-bold light:bg-gray-200 dark:border-gray-700 rounded-t-lg border"
        >
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

        <div className="border-l border-r border-b rounded-b-lg dark:border-gray-700">
          {sourceData.map(({ account }, index) => (
            <OverviewProvider key={account} account={account}>
              <Collapse bordered={false} className="rounded-none hidable-collapse">
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
                        <Account account={account} heartbeats={heartbeats} />
                      </Col>
                      <Col className="flex-1 cursor-pointer">
                        <Row justify="space-around" align="middle">
                          <Col span={3} className="text-center">
                            <StakerOther />
                          </Col>
                          <Col span={3} className="text-center">
                            <StakerOwn />
                          </Col>
                          <Col span={3} className="text-center">
                            <ActiveCommission />
                          </Col>
                          <Col span={3} className="text-center">
                            <NextCommission />
                          </Col>
                          <Col span={3} className="text-center">
                            <Points points={points} account={account} />
                          </Col>
                          <Col span={3} className="text-center">
                            {byAuthor[account]}
                          </Col>
                          <Col span={2} className="flex justify-end items-center gap-8">
                            <ChartLink account={account} />

                            <AppstoreOutlined
                              className={`hover:text-${network.name}-main transform transition-colors duration-500 text-xl`}
                              onClick={() => {
                                window.open(`https://${network.name}.subscan.io/validator/${account}`, '_blank');
                              }}
                            />
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
          ))}
        </div>
      </Card>
    </>
  );
}
