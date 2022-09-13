import { Card, Breadcrumb, Table } from 'antd';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { ColumnsType } from 'antd/lib/table';
import { useEffect } from 'react';
import { formatDistanceStrict } from 'date-fns';
import { BN } from '@polkadot/util';
import { useTranslation } from 'react-i18next';

import {
  SearchParamsKey,
  RelayerRole,
  FeeMarketTab,
  DarwiniaChain,
  RelayerOrdersDataSource,
  SlashEntity,
  RewardEntity,
  QuoteEntity,
  OrderEntity,
} from '../../model';
import { AccountName } from '../widget/account/AccountName';
import { RELAYER_REWARD_SLASH, QUOTE_HISTORY, RELAYER_ORDERS } from '../../config';
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

  const { transformedData: rewardSlashData, refetch: refetchRewardAndSlash } = useCustomQuery<
    {
      relayer: {
        slashes: { nodes: Pick<SlashEntity, 'amount' | 'blockTime'>[] } | null;
        rewards: { nodes: Pick<RewardEntity, 'amount' | 'blockTime'>[] } | null;
      } | null;
    },
    { relayerId: string },
    { rewards: [number, number][]; slashs: [number, number][] }
  >(
    RELAYER_REWARD_SLASH,
    {
      variables: {
        relayerId: `${destination}-${relayerAddress}`,
      },
    },
    transformRelayerRewardSlash
  );

  const { transformedData: quoteData, refetch: refetchQuote } = useCustomQuery<
    { quoteHistory: Pick<QuoteEntity, 'data'> | null },
    { relayerId: string },
    [number, number][]
  >(
    QUOTE_HISTORY,
    {
      variables: {
        relayerId: `${destination}-${relayerAddress}`,
      },
    },
    transformRelayerQuotes
  );

  const {
    loading: relayerOrdersLoading,
    transformedData: relayerOrdersData,
    refetch: refetchRelayerOrders,
  } = useCustomQuery<
    {
      relayer?: {
        slashes: {
          nodes: (Pick<SlashEntity, 'amount' | 'relayerRole'> & {
            order: Pick<OrderEntity, 'lane' | 'nonce' | 'createBlockTime'> | null;
          })[];
        } | null;
        rewards: {
          nodes: (Pick<SlashEntity, 'amount' | 'relayerRole'> & {
            order: Pick<OrderEntity, 'lane' | 'nonce' | 'createBlockTime'> | null;
          })[];
        } | null;
      } | null;
    },
    { relayerId: string },
    RelayerOrdersDataSource[]
  >(
    RELAYER_ORDERS,
    {
      variables: {
        relayerId: `${destination}-${relayerAddress}`,
      },
    },
    transformRelayerOrders
  );

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
        searchParams.set(SearchParamsKey.NONCE, record.nonce);
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
          dataSource={relayerOrdersData || []}
          rowKey={(record) => `${record.lane}-${record.nonce}`}
          loading={relayerOrdersLoading}
        />
      </Card>
    </>
  );
};
