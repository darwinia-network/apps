import { Card, Breadcrumb, Table, Spin } from 'antd';
import { NavLink, Link } from 'react-router-dom';
import { ColumnsType } from 'antd/lib/table';
import { useRef, useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { format, compareAsc, formatDistanceStrict } from 'date-fns';
import { BN, BN_ZERO } from '@polkadot/util';
import { useTranslation } from 'react-i18next';

import * as echarts from 'echarts/core';
import {
  TitleComponent,
  TitleComponentOption,
  ToolboxComponent,
  ToolboxComponentOption,
  TooltipComponent,
  TooltipComponentOption,
  GridComponent,
  GridComponentOption,
  LegendComponent,
  LegendComponentOption,
} from 'echarts/components';
import { BarChart, BarSeriesOption, LineChart, LineSeriesOption } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

import { Segmented } from '../widget/fee-market';
import {
  SegmentedType,
  RelayerOrders,
  ChartState,
  SearchParamsKey,
  RelayerRole,
  FeeMarketTab,
  CrossChainDestination,
  RelayerRewardsAndSlashs,
  RelayerFeeHistory,
  RelayerOrderRewards,
} from '../../model';
import { Path } from '../../config/routes';
import { AccountName } from '../widget/account/AccountName';
import {
  RELAYER_ORDERS,
  LONG_LONG_DURATION,
  DATE_FORMAT,
  RELAYER_REWARDS_AND_SLASHS,
  RELAYER_FEE_HISTORY,
} from '../../config';
import { useApi } from '../../hooks';
import { fromWei, prettyNumber, getSegmentedDateByType } from '../../utils';

echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  LineChart,
  CanvasRenderer,
  UniversalTransition,
]);

type EChartsOption = echarts.ComposeOption<
  | TitleComponentOption
  | ToolboxComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | LegendComponentOption
  | BarSeriesOption
  | LineSeriesOption
>;

type DataSourceState = {
  orderId: string;
  time: string;
  reward: BN;
  slash: BN;
  relayerRole: RelayerRole[];
};

export const RelayerDetail = ({
  relayer: relayerAddress,
  destination,
}: {
  relayer: string;
  destination: CrossChainDestination;
}) => {
  const { network } = useApi();
  const { t } = useTranslation();
  const rewardsSlashsRef = useRef<HTMLDivElement>(null);
  const feeHistoryRef = useRef<HTMLDivElement>(null);
  const [feeSegmented, setFeeSegmented] = useState(SegmentedType.ALL);
  const [rewardSlashSegmented, setRewardSlashSegmented] = useState(SegmentedType.ALL);

  const [dataSource, setDataSource] = useState<DataSourceState[]>([]);
  const [feeHistoryState, setFeeHistoryState] = useState<ChartState>({ dates: [], data: [] });
  const [rewardsAndSlashsState, setRewardsAndSlashsState] = useState<{
    dates: string[];
    slash: string[];
    reward: string[];
  }>({
    dates: [],
    slash: [],
    reward: [],
  });

  const { data: rewardsAndSlashsData, loading: rewardsAndSlashsLoading } = useQuery(RELAYER_REWARDS_AND_SLASHS, {
    variables: {
      relayer: `${destination}-${relayerAddress}`,
      lastTime: getSegmentedDateByType(rewardSlashSegmented),
    },
    pollInterval: LONG_LONG_DURATION,
    notifyOnNetworkStatusChange: true,
  }) as { data: RelayerRewardsAndSlashs | null; loading: boolean };

  const { data: feeHistoryData, loading: feeHistoryLoading } = useQuery(RELAYER_FEE_HISTORY, {
    variables: {
      relayer: `${destination}-${relayerAddress}`,
      lastTime: getSegmentedDateByType(feeSegmented),
    },
    pollInterval: LONG_LONG_DURATION,
    notifyOnNetworkStatusChange: true,
  }) as { data: RelayerFeeHistory | null; loading: boolean };

  const { loading: relayerOrdersLoading, data: relayerOrdersData } = useQuery(RELAYER_ORDERS, {
    variables: {
      relayer: `${destination}-${relayerAddress}`,
    },
    pollInterval: LONG_LONG_DURATION,
    notifyOnNetworkStatusChange: true,
  }) as {
    loading: boolean;
    data: RelayerOrders | null;
  };

  const columns: ColumnsType<DataSourceState> = [
    {
      title: t('Order ID'),
      key: 'orderId',
      dataIndex: 'orderId',
      align: 'center',
      render: (value) => {
        const searchParams = new URLSearchParams();
        searchParams.set(SearchParamsKey.TAB, FeeMarketTab.OREDERS);
        searchParams.set(SearchParamsKey.ORDER, value);
        searchParams.set(SearchParamsKey.DESTINATION, destination || '');
        return (
          <Link to={`${Path.feemarket}?${searchParams.toString()}`} target="_blank">
            {value}
          </Link>
        );
      },
    },
    {
      title: t('Relayer Role'),
      key: 'relayerRole',
      dataIndex: 'relayerRole',
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
      key: 'time',
      dataIndex: 'time',
      align: 'center',
      render: (value) => formatDistanceStrict(new Date(value), new Date(), { addSuffix: true }),
    },
  ];

  // eslint-disable-next-line complexity
  useEffect(() => {
    if (rewardsAndSlashsData?.relayerEntity) {
      const {
        slashs: slashsOrigin,
        assignedRewards,
        deliveredRewards,
        confirmedRewards,
      } = rewardsAndSlashsData.relayerEntity;

      const slashs = slashsOrigin?.nodes || [];
      const rewards = (assignedRewards?.nodes || [])
        .map((node) => ({ rewardTime: node.rewardTime, rewardAmount: node.assignedAmount }))
        .concat(
          (deliveredRewards?.nodes || []).map((node) => ({
            rewardTime: node.rewardTime,
            rewardAmount: node.deliveredAmount,
          }))
        )
        .concat(
          (confirmedRewards?.nodes || []).map((node) => ({
            rewardTime: node.rewardTime,
            rewardAmount: node.confirmedAmount,
          }))
        );

      const slashDaysCount =
        slashs.reduce((acc, { amount, slashTime }) => {
          const day = format(new Date(slashTime), DATE_FORMAT);
          acc[day] = acc[day] ? acc[day].add(new BN(amount)) : new BN(amount);
          return acc;
        }, {} as Record<string, BN>) || {};

      const rewardDaysCount =
        rewards.reduce((acc, { rewardTime, rewardAmount }) => {
          const day = format(new Date(rewardTime), DATE_FORMAT);
          acc[day] = acc[day] ? acc[day].add(new BN(rewardAmount)) : new BN(rewardAmount);
          return acc;
        }, {} as Record<string, BN>) || {};

      const rewardAndSlashDates = Array.from(
        Object.keys(slashDaysCount)
          .concat(Object.keys(rewardDaysCount))
          .reduce((acc, cur) => {
            acc.add(cur);
            return acc;
          }, new Set<string>())
      ).sort((a, b) => compareAsc(new Date(a), new Date(b)));

      setRewardsAndSlashsState({
        dates: rewardAndSlashDates,
        ...(rewardAndSlashDates.reduce(
          ({ slash, reward }, day) => {
            reward.push(rewardDaysCount[day] ? fromWei({ value: rewardDaysCount[day] }, prettyNumber) : '0');
            slash.push(slashDaysCount[day] ? fromWei({ value: slashDaysCount[day] }, prettyNumber) : '0');
            return { reward, slash };
          },
          { reward: [], slash: [] } as { reward: string[]; slash: string[] }
        ) || { reward: [], slash: [] }),
      });
    } else {
      setRewardsAndSlashsState({ dates: [], slash: [], reward: [] });
    }
  }, [rewardsAndSlashsData?.relayerEntity]);

  useEffect(() => {
    if (feeHistoryData?.relayerEntity) {
      const fees = feeHistoryData.relayerEntity.feeHistory?.nodes || [];

      setFeeHistoryState({
        dates: fees.map((fee) => format(new Date(fee.newfeeTime), DATE_FORMAT)),
        data: fees.map((fee) => fromWei({ value: fee.fee }, prettyNumber)),
      });
    } else {
      setFeeHistoryState({ dates: [], data: [] });
    }
  }, [feeHistoryData?.relayerEntity]);

  // eslint-disable-next-line complexity
  useEffect(() => {
    if (relayerOrdersData?.relayerEntity) {
      const { assignedOrders, deliveredOrders, confirmedOrders, slashs } = relayerOrdersData.relayerEntity;

      const updateRelayerOrders = (
        source: DataSourceState[],
        id: string,
        finishTime: string,
        slashAmount?: string,
        rewards?: RelayerOrderRewards
      ) => {
        const orderId = id.split('-')[1];

        const idx = source.findIndex((item) => item.orderId === orderId);
        const order =
          idx >= 0
            ? source[idx]
            : {
                orderId,
                time: finishTime,
                reward: BN_ZERO,
                slash: BN_ZERO,
                relayerRole: [],
              };

        const role = new Set<RelayerRole>(order.relayerRole);

        if (slashAmount) {
          role.add(RelayerRole.ASSIGNED);
          order.slash = order.slash.add(new BN(slashAmount));
        } else if (rewards) {
          const reward = rewards.nodes.reduce((acc, cur) => {
            if (cur.assignedRelayerId?.split('-')[1] === relayerAddress && cur.assignedAmount) {
              role.add(RelayerRole.ASSIGNED);
              acc = acc.add(new BN(cur.assignedAmount));
            }
            if (cur.deliveredRelayerId.split('-')[1] === relayerAddress) {
              role.add(RelayerRole.DELIVERY);
              acc = acc.add(new BN(cur.deliveredAmount));
            }
            if (cur.confirmedRelayerId.split('-')[1] === relayerAddress) {
              role.add(RelayerRole.CONFIRMED);
              acc = acc.add(new BN(cur.confirmedAmount));
            }
            return acc;
          }, BN_ZERO);

          order.reward = order.reward.add(reward);
        }

        order.relayerRole = Array.from(role);
        source.splice(idx, idx === -1 ? 0 : 1, order);

        return source;
      };

      const relayerSlashOrders =
        slashs?.nodes.reduce((slashOrders: DataSourceState[], { amount, order: { id, finishTime } }) => {
          return updateRelayerOrders(slashOrders, id, finishTime, amount, undefined);
        }, []) || [];

      const relayerOrders = (assignedOrders?.nodes || [])
        .concat(deliveredOrders?.nodes || [])
        .concat(confirmedOrders?.nodes || [])
        .reduce((slashAndRewardOrders: DataSourceState[], { id, finishTime, rewards }) => {
          return updateRelayerOrders(slashAndRewardOrders, id, finishTime, undefined, rewards);
        }, relayerSlashOrders);

      setDataSource(relayerOrders.sort((a, b) => Number(b.orderId) - Number(a.orderId)));
    } else {
      setDataSource([]);
    }
  }, [relayerOrdersData, relayerAddress]);

  useEffect(() => {
    if (!rewardsSlashsRef.current) {
      return;
    }

    const option: EChartsOption = {
      title: {
        text: t('Reward & Slash'),
        left: 0,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999',
          },
        },
      },
      legend: {
        data: ['Reward', 'Slash'],
        bottom: 0,
      },
      xAxis: [
        {
          type: 'category',
          data: rewardsAndSlashsState.dates,
          axisPointer: {
            type: 'shadow',
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Reward',
        },
        {
          type: 'value',
          name: 'Slash',
        },
      ],
      series: [
        {
          name: 'Slash',
          type: 'bar',
          tooltip: {
            valueFormatter(value) {
              return `${value} ${network.tokens.ring.symbol}`;
            },
          },
          data: rewardsAndSlashsState.slash,
        },
        {
          name: 'Reward',
          type: 'bar',
          tooltip: {
            valueFormatter(value) {
              return `${value} ${network.tokens.ring.symbol}`;
            },
          },
          data: rewardsAndSlashsState.reward,
        },
      ],
    };

    const instance = echarts.init(rewardsSlashsRef.current);
    instance.setOption(option);

    return () => instance.dispose();
  }, [network.tokens.ring.symbol, rewardsAndSlashsState, t]);

  useEffect(() => {
    if (!feeHistoryRef.current) {
      return;
    }

    const option: EChartsOption = {
      title: {
        text: t('Quote History'),
        left: 0,
      },
      xAxis: {
        type: 'category',
        data: feeHistoryState.dates,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: feeHistoryState.data,
          type: 'line',
        },
      ],
    };

    const instance = echarts.init(feeHistoryRef.current);
    instance.setOption(option);

    return () => instance.dispose();
  }, [feeHistoryState, t]);

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

      <Card className="mt-1">
        <div className="flex items-center justify-between">
          <div className="relative" style={{ width: '49%' }}>
            <div className="flex items-center justify-end">
              <Segmented value={rewardSlashSegmented} onSelect={setRewardSlashSegmented} />
            </div>
            <Spin spinning={rewardsAndSlashsLoading}>
              <div ref={rewardsSlashsRef} className="h-96 w-full" />
            </Spin>
          </div>
          <div className="relative" style={{ width: '49%' }}>
            <div className="flex items-center justify-end">
              <Segmented value={feeSegmented} onSelect={setFeeSegmented} />
            </div>
            <Spin spinning={feeHistoryLoading}>
              <div ref={feeHistoryRef} className="h-96 w-full" />
            </Spin>
          </div>
        </div>
      </Card>
      <Card className="mt-4">
        <Table columns={columns} dataSource={dataSource} rowKey="orderId" loading={relayerOrdersLoading} />
      </Card>
    </>
  );
};
