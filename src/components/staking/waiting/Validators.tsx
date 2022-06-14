import { LineChartOutlined } from '@ant-design/icons';
import { DeriveStakingOverview } from '@polkadot/api-derive/staking/types';
import { DeriveHeartbeats } from '@polkadot/api-derive/types';
import { Col, Collapse, Input, Row, Spin, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from, switchMap, timer } from 'rxjs';
import { MIDDLE_DURATION } from '../../../config';
import { useApi, useIsMountedOperator, useNominatorEntries, useStaking } from '../../../hooks';
import { STAKING_FAV_KEY, useFavorites } from '../../../hooks/favorites';
import { AccountWithClassifiedInfo, createClassifiedStakingOverview } from '../../../utils';
import { HidablePanel } from '../HidablePanel';
import { OverviewProvider } from '../overview/overview';
import { Account, ActiveCommission, NextCommission, Nominators } from '../overview/overview-widgets';

interface ValidatorsProps {
  overview: DeriveStakingOverview;
}

export function Validators({ overview }: ValidatorsProps) {
  const { t } = useTranslation();
  const { api, network } = useApi();
  const { stashAccounts } = useStaking();
  const [favorites] = useFavorites(STAKING_FAV_KEY);
  const [searchName, setSearchName] = useState('');
  const [sourceData, setSourceData] = useState<AccountWithClassifiedInfo[]>([]);
  const [heartbeats, setHeartbeats] = useState<DeriveHeartbeats | null>(null);
  const { nominatedBy } = useNominatorEntries();
  const { takeWhileIsMounted } = useIsMountedOperator();

  useEffect(() => {
    const validators = overview.validators.map((item) => item.toString());
    const { elected, waiting } = createClassifiedStakingOverview(
      overview,
      favorites,
      stashAccounts.filter((item) => !validators.includes(item))
    );

    setSourceData([...elected, ...waiting]);
  }, [stashAccounts, favorites, overview]);

  useEffect(() => {
    const sub$$ = timer(0, MIDDLE_DURATION)
      .pipe(
        switchMap((_) => from(api.derive.imOnline.receivedHeartbeats())),
        takeWhileIsMounted()
      )
      .subscribe((res) => {
        setHeartbeats(res);
      });

    return () => {
      sub$$.unsubscribe();
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
        className="mt-4 mb-8 lg:w-1/3"
      />

      <div className="overflow-x-scroll bg-white dark:bg-antDark rounded-xl p-0 lg:p-8 shadow-xxl">
        <Row
          justify="space-between"
          align="middle"
          className="p-4 font-bold bg-gray-100 dark:bg-gray-800 dark:border-gray-700 rounded-t-xl border overflow-x-scroll"
          style={{ minWidth: 1080 }}
        >
          <Col span={10} className="pl-8">
            {t('Intentions')}
          </Col>
          <Col className="flex-1">
            <Row align="middle" justify="space-around">
              <Col span={4} className="text-center">
                {t('commission')}
              </Col>
              <Col span={4} className="text-center">
                {t('next commission')}
              </Col>
              <Col span={2}></Col>
            </Row>
          </Col>
        </Row>

        <div className="border-l border-r border-b rounded-b-xl dark:border-gray-700" style={{ minWidth: 1080 }}>
          {/* eslint-disable-next-line complexity */}
          {sourceData.map(({ account }, index) => (
            <OverviewProvider key={account} account={account}>
              <Collapse
                bordered={false}
                className="hidable-collapse"
                style={{
                  borderRadius: index === sourceData.length - 1 ? '0 0 20px 20px' : 0,
                }}
              >
                <HidablePanel
                  showArrow={false}
                  account={account}
                  match={searchName}
                  collapsible={!nominatedBy ? 'disabled' : 'header'}
                  style={{ borderRadius: index === sourceData.length - 1 ? '0 0 20px 20px' : 0 }}
                  header={
                    <Row align="middle" justify="space-between">
                      <Col
                        span={10}
                        onClick={(event) => event.stopPropagation()}
                        className="flex items-center gap-4 pl-4"
                      >
                        <Account account={account} heartbeats={heartbeats} />
                      </Col>
                      <Col className="flex-1 cursor-pointer">
                        <Row justify="space-around" align="middle">
                          <Col span={4} className="text-center">
                            <ActiveCommission />
                          </Col>
                          <Col span={4} className="text-center">
                            <NextCommission />
                          </Col>
                          <Col span={2} className="flex justify-end items-center gap-8">
                            <Tooltip title={t('Coming soon')}>
                              <LineChartOutlined
                                className={`hover:text-${network.name}-main transform transition-colors duration-500 text-xl`}
                              />
                            </Tooltip>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  }
                  extra={
                    !nominatedBy && (
                      <Tooltip title={t('Nominators loading')}>
                        <Spin
                          size="small"
                          className="-translate-y-1/2 absolute ant-collapse-extra right-4 top-1/2 transform"
                        />
                      </Tooltip>
                    )
                  }
                  key={account}
                >
                  {nominatedBy && <Nominators data={nominatedBy[account]} />}
                </HidablePanel>
              </Collapse>
            </OverviewProvider>
          ))}
        </div>
      </div>
    </>
  );
}
