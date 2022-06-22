import { Card, Breadcrumb, Table } from 'antd';
import { NavLink } from 'react-router-dom';
import { ColumnsType } from 'antd/lib/table';
import { useRef, useEffect, useState } from 'react';

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

import { useQuery } from '@apollo/client';
import { format, compareAsc, formatDistanceStrict } from 'date-fns';
import { BN, BN_ZERO } from '@polkadot/util';

import { Segmented } from '../widget/fee-market';
import { SegmentedType, RelayerDetailData, ChartState } from '../../model';
import { Path } from '../../config/routes';
import { AccountName } from '../widget/account/AccountName';
import { IdentAccountName } from '../widget/account/IdentAccountName';
import { SubscanLink } from '../widget/SubscanLink';
import { RELAYER_DETAIL, LONG_LONG_DURATION, DATE_FORMAT } from '../../config';
import { useFeeMarket, useApi } from '../../hooks';
import { fromWei, prettyNumber } from '../../utils';

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
  deliveryRelayer: string;
  confirmationRelayer: string;
  slotAssignedRelayer: string;
  startBlock: number;
  confirmBlock: number;
  time: string;
};

export const RelayerDetail = () => {
  const relayerAddress = new URL(window.location.href).searchParams.get('relayer');
  const { network } = useApi();
  const { destination } = useFeeMarket();
  const { loading, data } = useQuery(RELAYER_DETAIL, {
    variables: { relayer: `${destination}-${relayerAddress}` },
    pollInterval: LONG_LONG_DURATION,
    notifyOnNetworkStatusChange: true,
  }) as {
    loading: boolean;
    data: RelayerDetailData | null;
  };

  const inOutHistoryRef = useRef<HTMLDivElement>(null);
  const quoteHistoryRef = useRef<HTMLDivElement>(null);

  const [quoteSegmented, setQuoteSegmented] = useState(SegmentedType.ALL);
  const [rewardSlashSegmented, setRewardSlashSegmented] = useState(SegmentedType.ALL);

  const [dataSource, setDataSource] = useState<RelayerData[]>([]);
  const [quoteHistory, setQuoteHistory] = useState<ChartState>({ date: [], data: [] });
  const [slashRewardHistory, setSlashRewardHistory] = useState<{ date: string[]; slash: string[]; reward: string[] }>({
    date: [],
    slash: [],
    reward: [],
  });

  const columns: ColumnsType<RelayerData> = [
    {
      title: 'Order ID',
      key: 'orderId',
      dataIndex: 'orderId',
      align: 'center',
    },
    {
      title: 'Delivery Relayer',
      key: 'deliveryRelayer',
      dataIndex: 'deliveryRelayer',
      align: 'center',
      render: (value) => <IdentAccountName account={value} />,
    },
    {
      title: 'Confirmation Relayer',
      key: 'confirmationRelayer',
      dataIndex: 'confirmationRelayer',
      align: 'center',
      render: (value) => <IdentAccountName account={value} />,
    },
    {
      title: 'Slot Assigned Relayer',
      key: 'slotAssignedRelayer',
      dataIndex: 'slotAssignedRelayer',
      align: 'center',
      render: (value) => <IdentAccountName account={value} />,
    },
    {
      title: 'Start Block',
      key: 'startBlock',
      dataIndex: 'startBlock',
      align: 'center',
      render: (value) => <SubscanLink network={network.name} block={value} prefix="#" />,
    },
    {
      title: 'Confirm Block',
      key: 'confirmBlock',
      dataIndex: 'confirmBlock',
      align: 'center',
      render: (value) => <SubscanLink network={network.name} block={value} prefix="#" />,
    },
    {
      title: 'Finish Time',
      key: 'time',
      dataIndex: 'time',
      align: 'center',
      render: (value) => formatDistanceStrict(new Date(value), new Date()),
    },
  ];

  // eslint-disable-next-line complexity
  useEffect(() => {
    if (data?.relayerEntity) {
      const {
        feeHistory,
        slashs: slashsData,
        assignedRewards,
        deliveredRewards,
        confirmedRewards,
        assignedOrders,
        deliveredOrders,
        confirmedOrders,
      } = data.relayerEntity;

      const fees = feeHistory?.nodes || [];
      const slashs = slashsData?.nodes || [];
      const orders = (assignedOrders?.nodes || [])
        .concat(deliveredOrders?.nodes || [])
        .concat(confirmedOrders?.nodes || []);
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

      const slashState: Record<string, BN> = {};
      const rewardState: Record<string, BN> = {};

      slashs.forEach((slash) => {
        const date = format(new Date(slash.slashTime), DATE_FORMAT);
        const amount = slashState[date] || BN_ZERO;

        slashState[date] = amount.add(new BN(slash.amount));
      });

      rewards.forEach((reward) => {
        const date = format(new Date(reward.rewardTime), DATE_FORMAT);
        const amount = rewardState[date] || BN_ZERO;

        rewardState[date] = amount.add(new BN(reward.rewardAmount));
      });

      let slashRewardDate = Object.keys(slashState);
      Object.keys(rewardState).forEach((date) => {
        if (!slashRewardDate.some((item) => item === date)) {
          slashRewardDate.push(date);
        }
      });
      slashRewardDate = slashRewardDate.sort((a, b) => compareAsc(new Date(a), new Date(b)));

      setSlashRewardHistory({
        date: slashRewardDate,
        slash: slashRewardDate.map((date) =>
          slashState[date] ? fromWei({ value: slashState[date] }, prettyNumber) : '0'
        ),
        reward: slashRewardDate.map((date) =>
          rewardState[date] ? fromWei({ value: rewardState[date] }, prettyNumber) : '0'
        ),
      });

      setQuoteHistory({
        date: fees.map((fee) => format(new Date(fee.newfeeTime), DATE_FORMAT)),
        data: fees.map((fee) => fromWei({ value: fee.fee }, prettyNumber)),
      });

      setDataSource(
        orders.map((order) => {
          return {
            orderId: order.id.split('-')[1],
            deliveryRelayer: order.deliveredRelayerId.split('-')[1],
            confirmationRelayer: order.confirmedRelayerId.split('-')[1],
            slotAssignedRelayer: order.assignedRelayerId.split('-')[1],
            startBlock: order.createBlock,
            confirmBlock: order.finishBlock,
            time: order.finishTime,
          };
        })
      );
    } else {
      setDataSource([]);
      setQuoteHistory({ date: [], data: [] });
      setSlashRewardHistory({ date: [], slash: [], reward: [] });
    }
  }, [data]);

  useEffect(() => {
    if (!inOutHistoryRef.current) {
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
          data: slashRewardHistory.date,
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
          name: 'Reward',
          type: 'bar',
          tooltip: {
            valueFormatter(value) {
              return `${value} ${network.tokens.ring.symbol}`;
            },
          },
          data: slashRewardHistory.reward,
        },
        {
          name: 'Slash',
          type: 'bar',
          tooltip: {
            valueFormatter(value) {
              return `${value} ${network.tokens.ring.symbol}`;
            },
          },
          data: slashRewardHistory.slash,
        },
      ],
    };

    const instance = echarts.init(inOutHistoryRef.current);
    instance.setOption(option);

    return () => {
      if (instance) {
        instance.dispose();
      }
    };
  }, [network.tokens.ring.symbol, slashRewardHistory.date, slashRewardHistory.reward, slashRewardHistory.slash]);

  useEffect(() => {
    if (!quoteHistoryRef.current) {
      return;
    }

    const option: EChartsOption = {
      title: {
        text: 'Quote History',
        left: 0,
      },
      xAxis: {
        type: 'category',
        data: quoteHistory.date,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: quoteHistory.data,
          type: 'line',
        },
      ],
    };

    const instance = echarts.init(quoteHistoryRef.current);
    instance.setOption(option);

    return () => {
      if (instance) {
        instance.dispose();
      }
    };
  }, [quoteHistory.data, quoteHistory.date]);

  return (
    <>
      <Breadcrumb separator=">" className="flex">
        <Breadcrumb.Item>
          <NavLink to={`${Path.feemarket}?tab=relayers`}>Relayers</NavLink>
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
            <div ref={inOutHistoryRef} className="h-96 w-full" />
          </div>
          <div className="relative" style={{ width: '49%' }}>
            <div className="flex items-center justify-end">
              <Segmented value={quoteSegmented} onSelect={setQuoteSegmented} />
            </div>
            <div ref={quoteHistoryRef} className="h-96 w-full" />
          </div>
        </div>
      </Card>
      <Card className="mt-4">
        <Table columns={columns} dataSource={dataSource} rowKey="orderId" loading={loading} />
      </Card>
    </>
  );
};
