import { Card, Breadcrumb, Table } from 'antd';
import { NavLink, Link } from 'react-router-dom';
import { ColumnsType } from 'antd/lib/table';
import { useEffect } from 'react';
import { formatDistanceStrict } from 'date-fns';
import type { BN } from '@polkadot/util';
import { useTranslation } from 'react-i18next';

import {
  SearchParamsKey,
  RelayerRole,
  FeeMarketTab,
  CrossChainDestination,
  RelayerRewardsAndSlashsData,
  RelayerFeeHistoryData,
  RelayerOrdersData,
  RelayerOrdersState,
} from '../../model';
import { Path } from '../../config/routes';
import { AccountName } from '../widget/account/AccountName';
import { RELAYER_ORDERS, RELAYER_REWARDS_AND_SLASHS, RELAYER_FEE_HISTORY } from '../../config';
import { useApi, usePollIntervalQuery } from '../../hooks';
import {
  fromWei,
  prettyNumber,
  transformRewardsAndSlashs,
  transformFeeHistory,
  transformRelayerOrders,
} from '../../utils';
import { RewardAndSlashChart } from './RewardAndSlashChart';
import { QuoteHistoryChart } from './QuoteHistoryChart';

export const RelayerDetail = ({
  relayer: relayerAddress,
  destination,
  setRefresh,
}: {
  relayer: string;
  destination: CrossChainDestination;
  setRefresh: (fn: () => void) => void;
}) => {
  const { network } = useApi();
  const { t } = useTranslation();

  const { transformedData: rewardsAndSlashsState, refetch: refetchRewardsAndSlashs } = usePollIntervalQuery<
    RelayerRewardsAndSlashsData,
    { relayer: string },
    { rewards: [number, number][]; slashs: [number, number][] }
  >(
    RELAYER_REWARDS_AND_SLASHS,
    {
      variables: {
        relayer: `${destination}-${relayerAddress}`,
      },
    },
    transformRewardsAndSlashs
  );

  const { transformedData: feeHistoryState, refetch: refetchFeeHistory } = usePollIntervalQuery<
    RelayerFeeHistoryData,
    { relayer: string },
    [number, number][]
  >(
    RELAYER_FEE_HISTORY,
    {
      variables: {
        relayer: `${destination}-${relayerAddress}`,
      },
    },
    transformFeeHistory
  );

  const {
    loading: relayerOrdersLoading,
    transformedData: relayerOrdersState,
    refetch: refetchRelayerOrders,
  } = usePollIntervalQuery<RelayerOrdersData, { relayer: string }, RelayerOrdersState[]>(
    RELAYER_ORDERS,
    {
      variables: {
        relayer: `${destination}-${relayerAddress}`,
      },
    },
    transformRelayerOrders
  );

  useEffect(() => {
    setRefresh(() => () => {
      refetchRewardsAndSlashs();
      refetchFeeHistory();
      refetchRelayerOrders();
    });
  }, [setRefresh, refetchRewardsAndSlashs, refetchFeeHistory, refetchRelayerOrders]);

  const columns: ColumnsType<RelayerOrdersState> = [
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
        <RewardAndSlashChart
          rewardData={rewardsAndSlashsState?.rewards || []}
          slashData={rewardsAndSlashsState?.slashs || []}
        />
        <QuoteHistoryChart data={feeHistoryState || []} />
      </div>

      <Card className="mt-4">
        <Table columns={columns} dataSource={relayerOrdersState} rowKey="orderId" loading={relayerOrdersLoading} />
      </Card>
    </>
  );
};
