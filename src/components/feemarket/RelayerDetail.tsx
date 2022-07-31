import { Card, Breadcrumb, Table, Spin } from 'antd';
import { NavLink, Link } from 'react-router-dom';
import { ColumnsType } from 'antd/lib/table';
import { useRef, useEffect, useState } from 'react';
import { formatDistanceStrict } from 'date-fns';
import type { BN } from '@polkadot/util';
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
  SearchParamsKey,
  RelayerRole,
  FeeMarketTab,
  CrossChainDestination,
  RelayerRewardsAndSlashsData,
  RewardsAndSlashsState,
  RelayerFeeHistoryData,
  FeeHistoryState,
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
  getSegmentedDateByType,
  transformRewardsAndSlashs,
  transformFeeHistory,
  transformRelayerOrders,
} from '../../utils';

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
  const rewardsSlashsRef = useRef<HTMLDivElement>(null);
  const feeHistoryRef = useRef<HTMLDivElement>(null);
  const [feeSegmented, setFeeSegmented] = useState(SegmentedType.ALL);
  const [rewardSlashSegmented, setRewardSlashSegmented] = useState(SegmentedType.ALL);

  const {
    loading: rewardsAndSlashsLoading,
    transformedData: rewardsAndSlashsState,
    refetch: refetchRewardsAndSlashs,
  } = usePollIntervalQuery<RelayerRewardsAndSlashsData, { relayer: string; time: string }, RewardsAndSlashsState>(
    RELAYER_REWARDS_AND_SLASHS,
    {
      variables: {
        relayer: `${destination}-${relayerAddress}`,
        time: getSegmentedDateByType(rewardSlashSegmented),
      },
    },
    transformRewardsAndSlashs
  );

  const {
    loading: feeHistoryLoading,
    transformedData: feeHistoryState,
    refetch: refetchFeeHistory,
  } = usePollIntervalQuery<RelayerFeeHistoryData, { relayer: string; time: string }, FeeHistoryState>(
    RELAYER_FEE_HISTORY,
    {
      variables: {
        relayer: `${destination}-${relayerAddress}`,
        time: getSegmentedDateByType(feeSegmented),
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
        return (
          <Link to={`${Path.feemarket}?${searchParams.toString()}`} target="_blank">
            {value}
          </Link>
        );
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
      render: (value) => formatDistanceStrict(new Date(value), new Date(), { addSuffix: true }),
    },
  ];

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
          data: rewardsAndSlashsState?.dates,
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
          data: rewardsAndSlashsState?.slashs,
        },
        {
          name: 'Reward',
          type: 'bar',
          tooltip: {
            valueFormatter(value) {
              return `${value} ${network.tokens.ring.symbol}`;
            },
          },
          data: rewardsAndSlashsState?.rewards,
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
        data: feeHistoryState?.dates,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: feeHistoryState?.values,
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
        <Table columns={columns} dataSource={relayerOrdersState} rowKey="orderId" loading={relayerOrdersLoading} />
      </Card>
    </>
  );
};
