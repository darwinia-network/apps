import { Card, Breadcrumb, Table } from 'antd';
import { NavLink, Link } from 'react-router-dom';
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
import { Path } from '../../config/routes';
import { AccountName } from '../widget/account/AccountName';
import { RELAYER_REWARD_SLASH, REWARD_SIMPLE, RELAYER_QUOTES, RELAYER_ORDERS, ORDER_SIMPLE } from '../../config';
import { useApi, useMyQuery } from '../../hooks';
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
  const apollo = useApolloClient();
  const [rewardSlashData, setRewardSlashData] = useState<{
    rewards: [number, number][];
    slashs: [number, number][];
  } | null>(null);
  const [dataSource, setDataSource] = useState<RelayerOrdersDataSource[]>([]);

  const { data: relayerRewardSlashData, refetch: refetchRelayerRewardSlash } = useMyQuery<
    TRelayerRewardSlash,
    { relayerId: string }
  >(RELAYER_REWARD_SLASH, {
    variables: {
      relayerId: `${destination}-${relayerAddress}`,
    },
  });

  const { transformedData: relayerQuotesData, refetch: refetchRelayerQuotes } = useMyQuery<
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
  } = useMyQuery<TRelayerOrders, { relayerId: string }>(RELAYER_ORDERS, {
    variables: {
      relayerId: `${destination}-${relayerAddress}`,
    },
  });

  useEffect(() => {
    const assignedObs = relayerRewardSlashData?.relayer?.assignedRelayerRewardsId?.length
      ? forkJoin(
          relayerRewardSlashData.relayer.assignedRelayerRewardsId.map((rewardId) =>
            apollo.query<TRewardSimple, { rewardId: string }>({
              query: REWARD_SIMPLE,
              variables: { rewardId },
            })
          )
        )
      : Promise.resolve([]);

    const deliveredObs = relayerRewardSlashData?.relayer?.deliveredRelayerRewardsId?.length
      ? forkJoin(
          relayerRewardSlashData.relayer.deliveredRelayerRewardsId.map((rewardId) =>
            apollo.query<TRewardSimple, { rewardId: string }>({
              query: REWARD_SIMPLE,
              variables: { rewardId },
            })
          )
        )
      : Promise.resolve([]);

    const confirmedObs = relayerRewardSlashData?.relayer?.confirmedRelayerRewardsId?.length
      ? forkJoin(
          relayerRewardSlashData?.relayer?.confirmedRelayerRewardsId?.map((rewardId) =>
            apollo.query<TRewardSimple, { rewardId: string }>({
              query: REWARD_SIMPLE,
              variables: { rewardId },
            })
          )
        )
      : Promise.resolve([]);

    const sub$$ = forkJoin([assignedObs, deliveredObs, confirmedObs]).subscribe(
      ([assignedRewards, deliveredRewards, confirmedRewards]) => {
        setRewardSlashData(
          transformRelayerRewardSlash(
            relayerAddress,
            assignedRewards,
            deliveredRewards,
            confirmedRewards,
            relayerRewardSlashData?.relayer?.slashs?.nodes
          )
        );
      }
    );

    return () => sub$$.unsubscribe();
  }, [apollo, relayerAddress, relayerRewardSlashData]);

  useEffect(() => {
    const assignedObs = relayerOrdersData?.relayer?.assignedRelayerOrdersId?.length
      ? forkJoin(
          relayerOrdersData?.relayer?.assignedRelayerOrdersId?.map((orderId) =>
            apollo.query<TOrderSimple, { orderId: string }>({
              query: ORDER_SIMPLE,
              variables: { orderId },
            })
          )
        )
      : Promise.resolve([]);

    const deliveredObs = relayerOrdersData?.relayer?.deliveredRelayerOrdersId?.length
      ? forkJoin(
          relayerOrdersData?.relayer?.deliveredRelayerOrdersId?.map((orderId) =>
            apollo.query<TOrderSimple, { orderId: string }>({
              query: ORDER_SIMPLE,
              variables: { orderId },
            })
          )
        )
      : Promise.resolve([]);

    const confirmedObs = relayerOrdersData?.relayer?.confirmedRelayerOrdersId?.length
      ? forkJoin(
          relayerOrdersData?.relayer?.confirmedRelayerOrdersId?.map((orderId) =>
            apollo.query<TOrderSimple, { orderId: string }>({
              query: ORDER_SIMPLE,
              variables: { orderId },
            })
          )
        )
      : Promise.resolve([]);

    const sub$$ = forkJoin([assignedObs, deliveredObs, confirmedObs]).subscribe(
      ([assignedOrders, deliveredOrders, confirmedOrders]) => {
        setDataSource(
          transformRelayerOrders(
            assignedOrders,
            deliveredOrders,
            confirmedOrders,
            relayerOrdersData?.relayer?.id,
            relayerOrdersData?.relayer?.slashs?.nodes
          )
        );
      }
    );

    return () => sub$$.unsubscribe();
  }, [apollo, relayerOrdersData]);

  useEffect(() => {
    setRefresh(() => () => {
      refetchRelayerRewardSlash();
      refetchRelayerQuotes();
      refetchRelayerOrders();
    });
  }, [setRefresh, refetchRelayerRewardSlash, refetchRelayerQuotes, refetchRelayerOrders]);

  const columns: ColumnsType<RelayerOrdersDataSource> = [
    {
      title: t('Order ID'),
      key: 'orderId',
      dataIndex: 'orderId',
      align: 'center',
      render: (value) => {
        const searchParams = new URLSearchParams();
        searchParams.set(SearchParamsKey.RPC, encodeURIComponent(network.provider.rpc));
        searchParams.set(SearchParamsKey.DESTINATION, destination);
        searchParams.set(SearchParamsKey.TAB, FeeMarketTab.OREDERS);
        searchParams.set(SearchParamsKey.ORDER, value);
        return <Link to={`${Path.feemarket}?${searchParams.toString()}`}>{value}</Link>;
      },
    },
    {
      title: t('Relayer Roles'),
      key: 'relayerRoles',
      dataIndex: 'relayerRoles',
      align: 'center',
      render: (value: RelayerRole[]) => (
        <div className="flex flex-col justify-center">
          {value.map((item) => (
            <span key={item}>{t(item)}</span>
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
      key: 'createTime',
      dataIndex: 'createTime',
      align: 'center',
      render: (value) => formatDistanceStrict(new Date(`${value}Z`), Date.now(), { addSuffix: true }),
    },
  ];

  return (
    <>
      <Breadcrumb separator=">" className="flex">
        <Breadcrumb.Item>
          <NavLink to={`${Path.feemarket}?tab=${FeeMarketTab.RELAYERS}`}>{t('Relayers')}</NavLink>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <AccountName account={relayerAddress || 'Unknown'} />
        </Breadcrumb.Item>
      </Breadcrumb>

      <div className="flex justify-between items-center mt-1 space-x-4">
        <RewardAndSlashChart rewardData={rewardSlashData?.rewards || []} slashData={rewardSlashData?.slashs || []} />
        <QuoteHistoryChart data={relayerQuotesData || []} />
      </div>

      <Card className="mt-4">
        <Table columns={columns} dataSource={dataSource} rowKey="orderId" loading={relayerOrdersLoading} />
      </Card>
    </>
  );
};
