import { Card, Breadcrumb, Table } from 'antd';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { ColumnsType } from 'antd/lib/table';
import { useEffect, useState } from 'react';
import { formatDistanceStrict } from 'date-fns';
import { BN } from '@polkadot/util';
import { useTranslation } from 'react-i18next';
import { forkJoin } from 'rxjs';
import { useApolloClient } from '@apollo/client';

import {
  SearchParamsKey,
  RelayerRole,
  FeeMarketTab,
  DarwiniaChain,
  RelayerOrdersDataSource,
  TRelayerRewardSlash,
  TRewardSimple,
  TRelayerQuotes,
  TRelayerOrders,
  TOrderSimple,
} from '../../model';
import { AccountName } from '../widget/account/AccountName';
import { RELAYER_REWARD_SLASH, REWARD_SIMPLE, RELAYER_QUOTES, RELAYER_ORDERS, ORDER_SIMPLE } from '../../config';
import { useApi, useCustomQuery } from '../../hooks';
import {
  fromWei,
  prettyNumber,
  transformRelayerQuotes,
  transformRelayerOrders,
  transformRelayerRewardSlash,
} from '../../utils';
import { RewardAndSlashChart } from './RewardAndSlashChart';
import { QuoteHistoryChart } from './QuoteHistoryChart';

export const RelayerDetail = ({
  relayer: relayerAddress,
  destination,
  setRefresh,
}: {
  relayer: string;
  destination: DarwiniaChain;
  setRefresh: (fn: () => void) => void;
}) => {
  const { network } = useApi();
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const apollo = useApolloClient();
  const [rewardSlashData, setRewardSlashData] = useState<{
    rewards: [number, number][];
    slashs: [number, number][];
  } | null>(null);
  const [dataSource, setDataSource] = useState<RelayerOrdersDataSource[]>([]);

  const { data: rewardAndSlashData, refetch: refetchRewardAndSlash } = useCustomQuery<
    TRelayerRewardSlash,
    { relayerId: string }
  >(RELAYER_REWARD_SLASH, {
    variables: {
      relayerId: `${destination}-${relayerAddress}`,
    },
  });

  const { transformedData: quoteData, refetch: refetchQuote } = useCustomQuery<
    TRelayerQuotes,
    { relayerId: string },
    [number, number][]
  >(
    RELAYER_QUOTES,
    {
      variables: {
        relayerId: `${destination}-${relayerAddress}`,
      },
    },
    transformRelayerQuotes
  );

  const {
    loading: relayerOrdersLoading,
    data: relayerOrdersData,
    refetch: refetchRelayerOrders,
  } = useCustomQuery<TRelayerOrders, { relayerId: string }>(RELAYER_ORDERS, {
    variables: {
      relayerId: `${destination}-${relayerAddress}`,
    },
  });

  useEffect(() => {
    const queryRewards = (rewardsId?: string[] | null) =>
      rewardsId?.length
        ? forkJoin(
            rewardsId.map((rewardId) =>
              apollo.query<TRewardSimple, { rewardId: string }>({
                query: REWARD_SIMPLE,
                variables: { rewardId },
              })
            )
          )
        : Promise.resolve([]);

    const sub$$ = forkJoin([
      queryRewards(rewardAndSlashData?.relayer?.assignedRelayerRewardsId),
      queryRewards(rewardAndSlashData?.relayer?.deliveredRelayerRewardsId),
      queryRewards(rewardAndSlashData?.relayer?.confirmedRelayerRewardsId),
    ]).subscribe(([assignedRewards, deliveredRewards, confirmedRewards]) => {
      setRewardSlashData(
        transformRelayerRewardSlash(
          relayerAddress,
          assignedRewards,
          deliveredRewards,
          confirmedRewards,
          rewardAndSlashData?.relayer?.slashs?.nodes
        )
      );
    });

    return () => sub$$.unsubscribe();
  }, [apollo, relayerAddress, rewardAndSlashData]);

  useEffect(() => {
    const queryOrders = (ordersId?: string[] | null) =>
      ordersId?.length
        ? forkJoin(
            ordersId.map((orderId) =>
              apollo.query<TOrderSimple, { orderId: string }>({
                query: ORDER_SIMPLE,
                variables: { orderId },
              })
            )
          )
        : Promise.resolve([]);

    const sub$$ = forkJoin([
      queryOrders(relayerOrdersData?.relayer?.assignedRelayerOrdersId),
      queryOrders(relayerOrdersData?.relayer?.deliveredRelayerOrdersId),
      queryOrders(relayerOrdersData?.relayer?.confirmedRelayerOrdersId),
    ]).subscribe(([assignedOrders, deliveredOrders, confirmedOrders]) => {
      setDataSource(
        transformRelayerOrders(
          relayerAddress,
          assignedOrders,
          deliveredOrders,
          confirmedOrders,
          relayerOrdersData?.relayer?.slashs?.nodes
        )
      );
    });

    return () => sub$$.unsubscribe();
  }, [apollo, relayerAddress, relayerOrdersData]);

  useEffect(() => {
    setRefresh(() => () => {
      refetchRewardAndSlash();
      refetchQuote();
      refetchRelayerOrders();
    });
  }, [setRefresh, refetchRewardAndSlash, refetchQuote, refetchRelayerOrders]);

  const columns: ColumnsType<RelayerOrdersDataSource> = [
    {
      title: t('Order ID'),
      align: 'center',
      render: (_, record) => {
        const searchParams = new URLSearchParams();
        searchParams.set(SearchParamsKey.RPC, encodeURIComponent(network.provider.rpc));
        searchParams.set(SearchParamsKey.DESTINATION, destination);
        searchParams.set(SearchParamsKey.TAB, FeeMarketTab.OREDERS);
        searchParams.set(SearchParamsKey.LANE, record.lane);
        searchParams.set(SearchParamsKey.NONCE, record.nonce.toString());
        return <Link to={`${pathname}?${searchParams.toString()}`}>{record.nonce}</Link>;
      },
    },
    {
      title: t('Relayer Roles'),
      key: 'relayerRoles',
      dataIndex: 'relayerRoles',
      align: 'center',
      render: (value: RelayerRole[]) => (
        <div className="flex flex-col justify-center">
          {value.map((role) => (
            <span key={role}>{t(role)}</span>
          ))}
        </div>
      ),
    },
    {
      title: t('Reward'),
      key: 'reward',
      dataIndex: 'reward',
      align: 'center',
      render: (value: BN) =>
        value.isZero() ? (
          '0'
        ) : (
          <span>
            {fromWei({ value }, prettyNumber)} {network.tokens.ring.symbol}
          </span>
        ),
    },
    {
      title: t('Slash'),
      key: 'slash',
      dataIndex: 'slash',
      align: 'center',
      render: (value: BN) =>
        value.isZero() ? (
          '0'
        ) : (
          <span>
            {fromWei({ value }, prettyNumber)} {network.tokens.ring.symbol}
          </span>
        ),
    },
    {
      title: t('Time'),
      align: 'center',
      render: (_, record) =>
        formatDistanceStrict(new Date(`${record.createBlockTime}Z`), Date.now(), { addSuffix: true }),
    },
  ];

  return (
    <>
      <Breadcrumb separator=">" className="flex">
        <Breadcrumb.Item>
          <NavLink to={`${pathname}?tab=${FeeMarketTab.RELAYERS}`}>{t('Relayers')}</NavLink>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <AccountName account={relayerAddress} />
        </Breadcrumb.Item>
      </Breadcrumb>

      <div className="flex justify-between items-center mt-1 space-x-4">
        <RewardAndSlashChart rewardData={rewardSlashData?.rewards || []} slashData={rewardSlashData?.slashs || []} />
        <QuoteHistoryChart data={quoteData || []} />
      </div>

      <Card className="mt-4">
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey={(record) => `${record.lane}-${record.nonce}`}
          loading={relayerOrdersLoading}
        />
      </Card>
    </>
  );
};
