import { compareAsc } from 'date-fns';
import { BN, BN_ZERO } from '@polkadot/util';

import { prettyNumber, fromWei } from '..';
import {
  RelayerRole,
  RelayerRewardsAndSlashsData,
  RelayerFeeHistoryData,
  RelayerOrdersData,
  RelayerOrdersState,
  OrderDetailData,
  OrderDetailState,
  OverviewStatisticsData,
  OverviewStatisticsState,
  FeeMarketFeeAndOderHistoryData,
} from '../../model';

const reduceDatesAndAmount = (previous: Record<string, BN>, time: string, amount: string) => {
  const day = `${time.split('T')[0]}Z`;
  previous[day] = previous[day] ? previous[day].add(new BN(amount)) : new BN(amount);
  return previous;
};

// eslint-disable-next-line complexity
export const transformRewardsAndSlashs = (
  data: RelayerRewardsAndSlashsData
): { rewards: [number, number][]; slashs: [number, number][] } => {
  if (data.relayerEntity) {
    const { assignedRewards, deliveredRewards, confirmedRewards, slashs: relayerSlashs } = data.relayerEntity;

    const datesRewards =
      (assignedRewards?.nodes || [])
        .map((node) => ({ time: node.rewardTime, amount: node.assignedAmount }))
        .concat(
          (deliveredRewards?.nodes || []).map((node) => ({
            time: node.rewardTime,
            amount: node.deliveredAmount,
          }))
        )
        .concat(
          (confirmedRewards?.nodes || []).map((node) => ({
            time: node.rewardTime,
            amount: node.confirmedAmount,
          }))
        )
        .reduce((acc, { time, amount }) => reduceDatesAndAmount(acc, time, amount), {} as Record<string, BN>) || {};

    const datesSlashs =
      (relayerSlashs?.nodes || []).reduce(
        (acc, { slashTime, amount }) => reduceDatesAndAmount(acc, slashTime, amount),
        {} as Record<string, BN>
      ) || {};

    const datesRewardsAndSlashs = Array.from(
      Object.keys(datesRewards)
        .concat(Object.keys(datesSlashs))
        .reduce((dates, date) => {
          dates.add(date);
          return dates;
        }, new Set<string>())
    ).sort((a, b) => compareAsc(new Date(a), new Date(b)));

    return {
      rewards: datesRewardsAndSlashs.map((date) => [
        new Date(date).getTime(),
        datesRewards[date] ? Number(fromWei({ value: datesRewards[date] }, prettyNumber)) : 0,
      ]),
      slashs: datesRewardsAndSlashs.map((date) => [
        new Date(date).getTime(),
        datesSlashs[date] ? Number(fromWei({ value: datesSlashs[date] }, prettyNumber)) : 0,
      ]),
    };
  }

  return { rewards: [], slashs: [] };
};

export const transformFeeHistory = (data: RelayerFeeHistoryData): [number, number][] => {
  const history = data.relayerEntity?.feeHistory?.nodes || [];

  return history.map(({ fee, newfeeTime }) => [
    new Date(`${newfeeTime}Z`).getTime(),
    Number(fromWei({ value: fee }, prettyNumber)),
  ]);
};

const updateOrders = (previous: RelayerOrdersState[], id: string, createTime: string) => {
  const orderId = id.split('-')[1];

  const idx = previous.findIndex((item) => item.orderId === orderId);
  const order =
    idx >= 0
      ? previous[idx]
      : {
          orderId,
          createTime,
          reward: BN_ZERO,
          slash: BN_ZERO,
          relayerRoles: [],
        };

  const roles = new Set<RelayerRole>(order.relayerRoles);

  return (
    slashOrRewards:
      | string
      | {
          nodes: {
            assignedAmount?: string;
            deliveredAmount?: string;
            confirmedAmount?: string;
          }[];
        }
      | null
      | undefined
  ) => {
    if (typeof slashOrRewards === 'string') {
      roles.add(RelayerRole.ASSIGNED);
      order.slash = order.slash.add(new BN(slashOrRewards));
    } else {
      slashOrRewards?.nodes.forEach(({ assignedAmount, deliveredAmount, confirmedAmount }) => {
        if (assignedAmount) {
          roles.add(RelayerRole.ASSIGNED);
          order.reward = order.reward.add(new BN(assignedAmount));
        }

        if (deliveredAmount) {
          roles.add(RelayerRole.DELIVERY);
          order.reward = order.reward.add(new BN(deliveredAmount));
        }

        if (confirmedAmount) {
          roles.add(RelayerRole.CONFIRMATION);
          order.reward = order.reward.add(new BN(confirmedAmount));
        }
      });
    }

    order.relayerRoles = Array.from(roles);
    previous.splice(idx, idx === -1 ? 0 : 1, order);

    return previous;
  };
};

// eslint-disable-next-line complexity
export const transformRelayerOrders = (data: RelayerOrdersData): RelayerOrdersState[] => {
  if (data.relayerEntity) {
    const { assignedOrders, deliveredOrders, confirmedOrders, slashs } = data.relayerEntity;

    let orders =
      slashs?.nodes.reduce((acc, { amount, order: { id, createTime } }) => {
        return updateOrders(acc, id, createTime)(amount);
      }, [] as RelayerOrdersState[]) || [];

    orders =
      assignedOrders?.nodes.reduce((acc, { id, createTime, rewards }) => {
        return updateOrders(acc, id, createTime)(rewards);
      }, orders) || orders;

    orders =
      deliveredOrders?.nodes.reduce((acc, { id, createTime, rewards }) => {
        return updateOrders(acc, id, createTime)(rewards);
      }, orders) || orders;

    orders =
      confirmedOrders?.nodes.reduce((acc, { id, createTime, rewards }) => {
        return updateOrders(acc, id, createTime)(rewards);
      }, orders) || orders;

    return orders.sort((a, b) => Number(b.orderId) - Number(a.orderId));
  }

  return [];
};

export const transformOrderDetail = (data: OrderDetailData): OrderDetailState | undefined => {
  if (data.orderEntity) {
    const { slashs, rewards } = data.orderEntity;

    return { ...data.orderEntity, slashs: slashs?.nodes || [], rewards: rewards?.nodes || [] };
  }

  return undefined;
};

export const transformOverviewStatistics = (data: OverviewStatisticsData): OverviewStatisticsState => {
  return {
    averageSpeed: data.feeMarketEntity?.averageSpeed || 0,
    totalOrders: data.feeMarketEntity?.totalOrders || 0,
    totalRewards: data.feeMarketEntity?.totalRewards || '0',
  };
};

export const transformFeeMarketFeeHistort = (data: FeeMarketFeeAndOderHistoryData): [number, number][] => {
  return (
    data.orderEntities?.nodes.map(({ fee, createTime }) => [
      new Date(`${createTime}Z`).getTime(),
      Number(fromWei({ value: fee }, prettyNumber)),
    ]) || []
  );
};

export const transformFeeMarketOrderHistort = (data: FeeMarketFeeAndOderHistoryData): [number, number][] => {
  const datesOrders =
    data.orderEntities?.nodes.reduce((acc, { createTime }) => {
      const date = `${createTime.split('T')[0]}T00:00:00Z`;
      acc[date] = (acc[date] || 0) + 1;

      return acc;
    }, {} as Record<string, number>) || {};

  return Object.keys(datesOrders).map((date) => [new Date(date).getTime(), datesOrders[date]]);
};
