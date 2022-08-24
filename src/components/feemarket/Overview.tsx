import { Card, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';
import { BN } from '@polkadot/util';
import type { Option, Vec, u128 } from '@polkadot/types';
import { Balance, AccountId32 } from '@polkadot/types/interfaces';
import { switchMap, from, forkJoin, EMPTY } from 'rxjs';
import { formatDistanceStrict } from 'date-fns';
import { useApolloClient } from '@apollo/client';

import { Statistics } from '../widget/Statistics';
import { FEE_MARKET_OVERVIEW, TOTAL_ORDERS_OVERVIEW, MARKET_FEE_OVERVIEW } from '../../config';
import { useApi, useMyQuery } from '../../hooks';
import { getFeeMarketApiSection, transformTotalOrdersOverview, fromWei, prettyNumber } from '../../utils';
import {
  PalletFeeMarketRelayer,
  DarwiniaChain,
  TFeeMarketOverview,
  TTotalOrderOverview,
  TMarketFeeOverview,
} from '../../model';
import { TooltipBalance } from '../../components/widget/TooltipBalance';
import { TotalOrdersChart } from './TotalOrdersChart';
import { FeeHistoryChart } from './FeeHistoryChart';

// eslint-disable-next-line complexity
export const Overview = ({
  destination,
  setRefresh,
}: {
  destination: DarwiniaChain;
  setRefresh: (fn: () => void) => void;
}) => {
  const { api, network } = useApi();
  const { t } = useTranslation();
  const apollo = useApolloClient();

  const [currentFee, setCurrentFee] = useState<{ value?: Balance; loading: boolean }>({ loading: true });
  const [totalRelayers, setTotalRelayers] = useState<{ total: number; active: number; loading: boolean }>({
    total: 0,
    active: 0,
    loading: true,
  });
  const [marketFeeOverviewData, setMarketFeeOverviewData] = useState<[number, number][]>([]);

  const {
    data: feeMarketOverviewData,
    loading: feeMarketOverviewLoading,
    refetch: refetchFeeMarketStatistics,
  } = useMyQuery<TFeeMarketOverview, { destination: DarwiniaChain }>(FEE_MARKET_OVERVIEW, {
    variables: {
      destination,
    },
  });

  const { transformedData: totalOrdersOverviewData, refetch: refetchTotalOrdersOverview } = useMyQuery<
    TTotalOrderOverview,
    { destination: DarwiniaChain },
    [number, number][]
  >(
    TOTAL_ORDERS_OVERVIEW,
    {
      variables: {
        destination,
      },
    },
    transformTotalOrdersOverview
  );

  const updateTotalRelayers = useCallback(() => {
    const apiSection = getFeeMarketApiSection(api, destination);

    if (apiSection) {
      setTotalRelayers((prev) => ({ ...prev, loading: true }));

      return from(api.query[apiSection].relayers<Vec<AccountId32>>())
        .pipe(
          switchMap((total) => {
            return total.length
              ? forkJoin(total.map((relayer) => api.query[apiSection].relayersMap<PalletFeeMarketRelayer>(relayer)))
              : EMPTY;
          })
        )
        .subscribe({
          next: (relayers) => {
            let active = 0;
            const collateralPerOrder = api.consts[apiSection].collateralPerOrder as u128;

            relayers.forEach((relayer) => {
              if (relayer.collateral.gte(collateralPerOrder)) {
                // https://github.com/darwinia-network/apps/issues/314
                active++;
              }
            });

            setTotalRelayers({
              active,
              total: relayers.length,
              loading: false,
            });
          },
          complete: () => setTotalRelayers((prev) => ({ ...prev, loading: false })),
          error: () => setTotalRelayers((prev) => ({ ...prev, loading: false })),
        });
    }

    return EMPTY.subscribe();
  }, [api, destination]);

  const updateCurrentFee = useCallback(() => {
    const apiSection = getFeeMarketApiSection(api, destination);

    if (apiSection) {
      setCurrentFee((prev) => ({ ...prev, loading: true }));

      return from(api.query[apiSection].assignedRelayers<Option<Vec<PalletFeeMarketRelayer>>>()).subscribe((res) => {
        if (res.isSome) {
          const lastOne = res.unwrap().pop();
          setCurrentFee({ loading: false, value: lastOne?.fee });
        } else {
          setCurrentFee({ loading: false, value: undefined });
        }
      });
    }

    return EMPTY.subscribe();
  }, [api, destination]);

  const queryMarketFee = useCallback(
    async (
      previous: { fee: string; timestamp: string }[],
      destination: DarwiniaChain
    ): Promise<{ fee: string; timestamp: string }[]> => {
      const result = await apollo.query<TMarketFeeOverview, { destination: string; offset: number }>({
        query: MARKET_FEE_OVERVIEW,
        variables: { destination, offset: previous.length },
      });

      previous = previous.concat(result.data.marketFees?.nodes || []);

      if (result.data.marketFees?.pageInfo.hasNextPage) {
        return await queryMarketFee(previous, destination);
      }

      return previous;
    },
    [apollo]
  );

  useEffect(() => {
    const sub$$ = from(queryMarketFee([], destination)).subscribe((data) => {
      const datesValues =
        data.reduce((acc, cur) => {
          const date = `${cur.timestamp.split('T')[0]}Z`;
          acc[date] = (acc[date] || new BN(cur.fee)).add(new BN(cur.fee)).divn(2); // eslint-disable-line no-magic-numbers
          return acc;
        }, {} as Record<string, BN>) || {};

      setMarketFeeOverviewData(
        Object.keys(datesValues).map((date) => [
          new Date(date).getTime(),
          Number(fromWei({ value: datesValues[date] }, prettyNumber)),
        ])
      );
    });

    return () => sub$$.unsubscribe();
  }, [destination, queryMarketFee]);

  useEffect(() => {
    setRefresh(() => () => {
      updateTotalRelayers();
      updateCurrentFee();
      refetchFeeMarketStatistics();
      refetchTotalOrdersOverview();
    });
  }, [setRefresh, updateTotalRelayers, updateCurrentFee, refetchFeeMarketStatistics, refetchTotalOrdersOverview]);

  useEffect(() => {
    const sub$$ = updateTotalRelayers();
    return () => sub$$.unsubscribe();
  }, [updateTotalRelayers]);

  useEffect(() => {
    const sub$$ = updateCurrentFee();
    return () => sub$$.unsubscribe();
  }, [updateCurrentFee]);

  return (
    <>
      <Card className="shadow-xxl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-0 lg:justify-items-center">
          <Statistics
            className="lg:border-r lg:justify-center"
            title={t('Total Relayers')}
            value={
              <Spin size="small" spinning={totalRelayers.loading}>
                <span>{`${totalRelayers.active} / ${totalRelayers.total}`}</span>
              </Spin>
            }
          />
          <Statistics
            className="lg:border-r lg:justify-center"
            title={t('Average Speed')}
            value={
              <Spin size="small" spinning={feeMarketOverviewLoading}>
                <span className="capitalize">
                  {formatDistanceStrict(
                    new Date(),
                    new Date(Date.now() + (feeMarketOverviewData?.market?.averageSpeed || 0))
                  )}
                </span>
              </Spin>
            }
          />
          <Statistics
            className="lg:border-r lg:justify-center"
            title={t('Current Message Fee')}
            value={
              <Spin size="small" spinning={currentFee.loading}>
                <TooltipBalance value={currentFee.value} precision={Number(network.tokens.ring.decimal)} />
                <span> {network.tokens.ring.symbol}</span>
              </Spin>
            }
          />
          <Statistics
            className="lg:border-r lg:justify-center"
            title={t('Total Rewards')}
            value={
              <Spin size="small" spinning={feeMarketOverviewLoading}>
                <TooltipBalance
                  value={feeMarketOverviewData?.market?.totalReward}
                  precision={Number(network.tokens.ring.decimal)}
                />
                <span> {network.tokens.ring.symbol}</span>
              </Spin>
            }
          />
          <Statistics
            className="lg:justify-center"
            title={t('Total Orders')}
            value={
              <Spin size="small" spinning={feeMarketOverviewLoading}>
                <span>
                  {(feeMarketOverviewData?.market?.finishedOrders || 0) +
                    (feeMarketOverviewData?.market?.inProgressInSlotOrders || 0) +
                    (feeMarketOverviewData?.market?.inProgressOutOfSlotOrders || 0)}
                </span>
              </Spin>
            }
          />
        </div>
      </Card>
      <div className="flex justify-between items-center space-x-4 mt-8">
        <TotalOrdersChart data={totalOrdersOverviewData || []} />
        <FeeHistoryChart data={marketFeeOverviewData || []} />
      </div>
    </>
  );
};
