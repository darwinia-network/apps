import { AppstoreOutlined } from '@ant-design/icons';
import { DeriveStakingOverview } from '@polkadot/api-derive/staking/types';
import { DeriveHeartbeats } from '@polkadot/api-derive/types';
import { EraRewardPoints } from '@polkadot/types/interfaces';
import { Col, Collapse, Input, Row } from 'antd';
import { Reducer, useCallback, useEffect, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from, switchMap, timer } from 'rxjs';
import { debounce } from 'lodash';
import { MIDDLE_DURATION } from '../../../config';
import { useApi, useIsMountedOperator, useStaking } from '../../../hooks';
import { STAKING_FAV_KEY, useFavorites } from '../../../hooks/favorites';
import { AccountWithClassifiedInfo, createClassifiedStakingOverview, formatNum } from '../../../utils';
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
          const blockNumber = formatNum(lastHeader.number.unwrap());
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleInputChange = useCallback(
    // eslint-disable-next-line no-magic-numbers
    debounce((event) => setSearchName(event.target.value), 300),
    []
  );

  useEffect(() => {
    return handleInputChange.cancel;
  }, [handleInputChange]);

  return (
    <>
      <Input
        onChange={handleInputChange}
        size="large"
        placeholder={t('Flite by name, address or index')}
        className="my-8 lg:w-1/3"
      />

      <div className="overflow-x-scroll bg-white dark:bg-antDark rounded-xl p-0 lg:p-8 shadow-xxl">
        <Row
          justify="space-between"
          align="middle"
          style={{ minWidth: 1080 }}
          className="p-4 font-bold bg-gray-100 dark:bg-gray-800 dark:border-gray-700 rounded-t-xl border overflow-x-scroll"
        >
          <Col lg={8} className="pl-8">
            {t('Validator')}
          </Col>
          <Col className="flex-1">
            <Row align="middle" justify="space-around">
              <Col lg={3} className="text-center">
                {t('other stake(power)')}
              </Col>
              <Col lg={3} className="text-center">
                {t('own stake(power)')}
              </Col>
              <Col lg={3} className="text-center">
                {t('active commission')}
              </Col>
              <Col lg={3} className="text-center">
                {t('next commission')}
              </Col>
              <Col lg={3} className="text-center">
                {t('points')}
              </Col>
              <Col lg={3} className="text-center">
                {t('last #')}
              </Col>
              <Col lg={2}></Col>
            </Row>
          </Col>
        </Row>

        <div className="border-l border-r border-b rounded-b-xl dark:border-gray-700" style={{ minWidth: 1080 }}>
          {sourceData.map(({ account }, index) => (
            <OverviewProvider key={account} account={account}>
              <Collapse
                bordered={false}
                className="hidable-collapse"
                style={{ borderRadius: index === sourceData.length - 1 ? '0 0 20px 20px' : 0 }}
              >
                <HidablePanel
                  showArrow={false}
                  account={account}
                  match={searchName}
                  style={index === sourceData.length - 1 ? { border: 'none' } : {}}
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
      </div>
    </>
  );
}
