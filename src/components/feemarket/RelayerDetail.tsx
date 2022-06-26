import { Card, Breadcrumb, Table, Spin } from 'antd';
import { NavLink, Link } from 'react-router-dom';
import { ColumnsType } from 'antd/lib/table';
import { useRef, useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { format, compareAsc, formatDistanceStrict } from 'date-fns';
import { BN, BN_ZERO } from '@polkadot/util';

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

type RelayerData = {
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
  const rewardsSlashsRef = useRef<HTMLDivElement>(null);
  const feeHistoryRef = useRef<HTMLDivElement>(null);
  const [feeSegmented, setFeeSegmented] = useState(SegmentedType.ALL);
  const [rewardSlashSegmented, setRewardSlashSegmented] = useState(SegmentedType.ALL);

  const [dataSource, setDataSource] = useState<RelayerData[]>([]);
  const [feeHistoryState, setFeeHistoryState] = useState<ChartState>({ date: [], data: [] });
  const [rewardsAndSlashsState, setRewardsAndSlashsState] = useState<{
    date: string[];
    slash: string[];
    reward: string[];
  }>({
    date: [],
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

  const columns: ColumnsType<RelayerData> = [
    {
      title: 'Order ID',
      key: 'orderId',
      dataIndex: 'orderId',
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
      title: 'Relayer Role',
      key: 'relayerRole',
      dataIndex: 'relayerRole',
      render: (value: RelayerRole[]) => (
        <div className="flex flex-col justify-center">
          {value.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      ),
    },
    {
      title: 'Reward',
      key: 'reward',
      dataIndex: 'reward',
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
      title: 'Slash',
      key: 'slash',
      dataIndex: 'slash',
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
      title: 'Time',
      key: 'time',
      dataIndex: 'time',
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
          acc[day] = acc[day] ? acc[day].add(new BN(amount)) : BN_ZERO;
          return acc;
        }, {} as Record<string, BN>) || {};

      const rewardDaysCount =
        rewards.reduce((acc, { rewardTime, rewardAmount }) => {
          const day = format(new Date(rewardTime), DATE_FORMAT);
          acc[day] = acc[day] ? acc[day].add(new BN(rewardAmount)) : BN_ZERO;
          return acc;
        }, {} as Record<string, BN>) || {};

      const rewardAndSlashDate = Array.from(
        Object.keys(slashDaysCount)
          .concat(Object.keys(rewardDaysCount))
          .reduce((acc, cur) => {
            acc.add(cur);
            return acc;
          }, new Set<string>())
      ).sort((a, b) => compareAsc(new Date(a), new Date(b)));

      setRewardsAndSlashsState({
        date: rewardAndSlashDate,
        ...(rewardAndSlashDate.reduce(
          ({ slash, reward }, day) => {
            reward.push(rewardDaysCount[day] ? fromWei({ value: rewardDaysCount[day] }, prettyNumber) : '0');
            slash.push(slashDaysCount[day] ? fromWei({ value: slashDaysCount[day] }, prettyNumber) : '0');
            return { reward, slash };
          },
          { reward: [], slash: [] } as { reward: string[]; slash: string[] }
        ) || { reward: [], slash: [] }),
      });
    } else {
      setRewardsAndSlashsState({ date: [], slash: [], reward: [] });
    }
  }, [rewardsAndSlashsData?.relayerEntity]);

  useEffect(() => {
    if (feeHistoryData?.relayerEntity) {
      const fees = feeHistoryData.relayerEntity.feeHistory?.nodes || [];

      setFeeHistoryState({
        date: fees.map((fee) => format(new Date(fee.newfeeTime), DATE_FORMAT)),
        data: fees.map((fee) => fromWei({ value: fee.fee }, prettyNumber)),
      });
    } else {
      setFeeHistoryState({ date: [], data: [] });
    }
  }, [feeHistoryData?.relayerEntity]);

  useEffect(() => {
    if (relayerOrdersData?.relayerEntity) {
      const { assignedOrders, deliveredOrders, confirmedOrders } = relayerOrdersData.relayerEntity;

      const orders = (assignedOrders?.nodes || [])
        .concat(deliveredOrders?.nodes || [])
        .concat(confirmedOrders?.nodes || []);

      setDataSource(
        orders.map((order) => {
          const role: RelayerRole[] = [];

          if (order.assignedRelayers.some((item) => item === relayerAddress)) {
            role.push(RelayerRole.INIT_ASSIGNED);
          }

          const reward = order.rewards.nodes.reduce((acc, cur) => {
            if (cur.assignedRelayerId?.split('-')[1] === relayerAddress && cur.assignedAmount) {
              role.push(RelayerRole.SLOT_ASSIGNED);
              acc = acc.add(new BN(cur.assignedAmount));
            }
            if (cur.deliveredRelayerId.split('-')[1] === relayerAddress) {
              role.push(RelayerRole.DELIVERY);
              acc = acc.add(new BN(cur.deliveredAmount));
            }
            if (cur.confirmedRelayerId.split('-')[1] === relayerAddress) {
              role.push(RelayerRole.CONFIRM);
              acc = acc.add(new BN(cur.confirmedAmount));
            }
            return acc;
          }, BN_ZERO);

          return {
            orderId: order.id.split('-')[1],
            relayerRole: role,
            time: order.finishTime,
            reward,
            slash: order.slashs.nodes.reduce((acc, cur) => {
              if (cur.relayerId.split('-')[1] === relayerAddress) {
                acc = acc.add(new BN(cur.amount));
              }
              return acc;
            }, BN_ZERO),
          };
        })
      );
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
        text: 'Reward & Slash',
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
          data: rewardsAndSlashsState.date,
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
  }, [network.tokens.ring.symbol, rewardsAndSlashsState]);

  useEffect(() => {
    if (!feeHistoryRef.current) {
      return;
    }

    const option: EChartsOption = {
      title: {
        text: 'Quote History',
        left: 0,
      },
      xAxis: {
        type: 'category',
        data: feeHistoryState.date,
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
  }, [feeHistoryState]);

  return (
    <>
      <Breadcrumb separator=">" className="flex">
        <Breadcrumb.Item>
          <NavLink to={`${Path.feemarket}?tab=${FeeMarketTab.RELAYERS}`}>Relayers</NavLink>
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
