import { compareAsc, compareDesc } from 'date-fns';
import { BN, BN_ZERO, bnToBn } from '@polkadot/util';

import { prettyNumber, fromWei } from '..';
import {
  RelayerRole,
  RelayerOrdersDataSource,
  OrderEntity,
  FeeEntity,
  SlashEntity,
  RewardEntity,
  SlashReward,
  QuoteEntity,
} from '../../model';

export const transformRelayerRewardSlash = (data: {
  relayer: {
    slashes: { nodes: Pick<SlashEntity, 'amount' | 'blockTime'>[] } | null;
    rewards: { nodes: Pick<RewardEntity, 'amount' | 'blockTime'>[] } | null;
  } | null;
}): { rewards: [number, number][]; slashs: [number, number][] } => {
  const slashes =
    data.relayer?.slashes?.nodes.reduce((acc, cur) => {
      const date = `${cur.blockTime.split('T')[0]}Z`;
      acc[date] = (acc[date] || BN_ZERO).add(bnToBn(cur.amount));
      return acc;
    }, {} as Record<string, BN>) || {};

  const rewards =
    data.relayer?.rewards?.nodes.reduce((acc, cur) => {
      const date = `${cur.blockTime.split('T')[0]}Z`;
      acc[date] = (acc[date] || BN_ZERO).add(bnToBn(cur.amount));
      return acc;
    }, {} as Record<string, BN>) || {};

  const combineDates = Array.from(
    Object.keys(rewards)
      .concat(Object.keys(slashes))
      .reduce((dates, date) => {
        return dates.add(date);
      }, new Set<string>())
  ).sort((a, b) => compareAsc(new Date(a), new Date(b)));

  return {
    rewards: combineDates.map((date) => [
      new Date(date).getTime(),
      rewards[date] ? Number(fromWei({ value: rewards[date] }, prettyNumber)) : 0,
    ]),
    slashs: combineDates.map((date) => [
      new Date(date).getTime(),
      slashes[date] ? Number(fromWei({ value: slashes[date] }, prettyNumber)) : 0,
    ]),
  };
};

export const transformRelayerQuotes = (data: {
  quoteHistory: Pick<QuoteEntity, 'data'> | null;
}): [number, number][] => {
  return (data.quoteHistory?.data || []).map(({ amount, blockTime }) => [
    new Date(blockTime).getTime(),
    Number(fromWei({ value: amount }, prettyNumber)),
  ]);
};

const reduceSlashReward = (
  previous: RelayerOrdersDataSource[],
  current: SlashReward,
  isSlash: boolean
): RelayerOrdersDataSource[] => {
  const idx = previous.findIndex((item) => item.lane === current.order?.lane && item.nonce === current.order.nonce);

  const row: RelayerOrdersDataSource =
    idx >= 0
      ? previous[idx]
      : {
          lane: current.order?.lane as string,
          nonce: current.order?.nonce as string,
          createBlockTime: current.order?.createBlockTime as string,
          reward: BN_ZERO,
          slash: BN_ZERO,
          relayerRoles: [] as RelayerRole[],
        };

  const roles = new Set<RelayerRole>(row.relayerRoles);
  row.relayerRoles = Array.from(roles.add(current.relayerRole));

  if (isSlash) {
    row.slash = row.slash.add(bnToBn(current.amount));
  } else {
    row.reward = row.reward.add(bnToBn(current.amount));
  }

  previous.splice(idx, idx === -1 ? 0 : 1, row);
  return previous;
};

export const transformRelayerOrders = (data: {
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
}): RelayerOrdersDataSource[] => {
  let dataSource: RelayerOrdersDataSource[] = [];

  dataSource =
    data.relayer?.rewards?.nodes.reduce((acc, cur) => reduceSlashReward(acc, cur, false), dataSource) || dataSource;
  dataSource =
    data.relayer?.slashes?.nodes.reduce((acc, cur) => reduceSlashReward(acc, cur, true), dataSource) || dataSource;

  return dataSource.sort((a, b) => compareDesc(new Date(a.createBlockTime), new Date(b.createBlockTime)));
};

export const transformTotalOrdersOverview = (data: {
  orders: { nodes: Pick<OrderEntity, 'createBlockTime'>[] } | null;
}): [number, number][] => {
  const datesOrders =
    data.orders?.nodes.reduce((acc, { createBlockTime }) => {
      const date = `${createBlockTime.split('T')[0]}Z`;
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

  return Object.keys(datesOrders).map((date) => [new Date(date).getTime(), datesOrders[date]]);
};

export const transformFeeHistory = (data: { feeHistory: Pick<FeeEntity, 'data'> | null }): [number, number][] => {
  const datesValues =
    data.feeHistory?.data?.reduce((acc, cur) => {
      const date = `${cur.blockTime.split('T')[0]}Z`;
      acc[date] = (acc[date] || new BN(cur.amount)).add(new BN(cur.amount)).divn(2); // eslint-disable-line no-magic-numbers
      return acc;
    }, {} as Record<string, BN>) || {};

  return Object.keys(datesValues).map((date) => [
    new Date(date).getTime(),
    Number(fromWei({ value: datesValues[date] }, prettyNumber)),
  ]);
};
