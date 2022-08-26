import { compareAsc, compareDesc } from 'date-fns';
import { BN, BN_ZERO, isArray, bnToBn } from '@polkadot/util';

import { prettyNumber, fromWei } from '..';
import {
  RelayerRole,
  RelayerOrdersDataSource,
  TTotalOrderOverview,
  TRewardSimple,
  TRelayerQuotes,
  TOrderSimple,
} from '../../model';

// eslint-disable-next-line complexity
export const transformRelayerRewardSlash = (
  relayerAddress: string,
  assignedRelayerRewards: { data: TRewardSimple }[],
  deliveredRelayerRewards: { data: TRewardSimple }[],
  confirmedRelayerRewards: { data: TRewardSimple }[],
  slashsData?: { amount: string; blockTime: string }[] | null
): { rewards: [number, number][]; slashs: [number, number][] } => {
  const reduceDatesAmount = (previous: Record<string, BN>, time: string, amount: string) => {
    const day = `${time.split('T')[0]}Z`;
    previous[day] = previous[day] ? previous[day].add(new BN(amount)) : new BN(amount);
    return previous;
  };

  // eslint-disable-next-line complexity
  const extractReward = (blockTime?: string, relayersId?: string[] | null, amounts?: string[] | string | null) => {
    const idx = (relayersId || []).findIndex((relayerId) => relayerId.split('-')[1] === relayerAddress);
    if (idx >= 0 && amounts?.length && blockTime) {
      return {
        blockTime,
        amount: isArray(amounts) ? amounts[idx] : (amounts || '').split(',')[idx],
      };
    }
    return null;
  };

  const rewards =
    assignedRelayerRewards
      .map(({ data: { reward } }) =>
        extractReward(reward?.blockTime, reward?.assignedRelayersId, reward?.assignedAmounts)
      )
      .concat(
        deliveredRelayerRewards.map(({ data: { reward } }) =>
          extractReward(reward?.blockTime, reward?.deliveredRelayersId, reward?.deliveredAmounts)
        )
      )
      .concat(
        confirmedRelayerRewards.map(({ data: { reward } }) =>
          extractReward(reward?.blockTime, reward?.confirmedRelayersId, reward?.confirmedAmounts)
        )
      )
      .reduce((acc, cur) => {
        if (cur) {
          return reduceDatesAmount(acc, cur.blockTime, cur.amount);
        }
        return acc;
      }, {} as Record<string, BN>) || {};

  const slashs =
    slashsData?.reduce((acc, cur) => reduceDatesAmount(acc, cur.blockTime, cur.amount), {} as Record<string, BN>) || {};

  const combineDates = Array.from(
    Object.keys(rewards)
      .concat(Object.keys(slashs))
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
      slashs[date] ? Number(fromWei({ value: slashs[date] }, prettyNumber)) : 0,
    ]),
  };
};

export const transformRelayerQuotes = (data: TRelayerQuotes): [number, number][] => {
  return (data.relayer?.quoteHistory?.nodes || []).map(({ amount, blockTime }) => [
    new Date(`${blockTime}Z`).getTime(),
    Number(fromWei({ value: amount }, prettyNumber)),
  ]);
};

// eslint-disable-next-line complexity
const reduceOrder = (
  previous: RelayerOrdersDataSource[],
  role: RelayerRole,
  relayerAddress: string,
  orderData: TOrderSimple
) => {
  const { order } = orderData;

  if (order) {
    const [, lane, nonce] = order.id.split('-');
    const idx = previous.findIndex((item) => item.lane === lane && item.nonce.toString() === nonce);

    const row: RelayerOrdersDataSource =
      idx >= 0
        ? previous[idx]
        : {
            lane,
            nonce: Number(nonce),
            createBlockTime: order.createBlockTime,
            reward: BN_ZERO,
            slash: BN_ZERO,
            relayerRoles: [] as RelayerRole[],
          };

    const roles = new Set<RelayerRole>(row.relayerRoles);
    row.relayerRoles = Array.from(roles.add(role));

    const reward =
      order.rewards?.nodes.reduce(
        // eslint-disable-next-line complexity
        (
          acc,
          {
            assignedAmounts,
            deliveredAmounts,
            confirmedAmounts,
            assignedRelayersId,
            deliveredRelayersId,
            confirmedRelayersId,
          }
        ) => {
          const amounts =
            role === RelayerRole.ASSIGNED
              ? isArray(assignedAmounts)
                ? assignedAmounts
                : (assignedAmounts || '').split(',')
              : role === RelayerRole.DELIVERY
              ? isArray(deliveredAmounts)
                ? deliveredAmounts
                : (deliveredAmounts || '').split(',')
              : isArray(confirmedAmounts)
              ? confirmedAmounts
              : (confirmedAmounts || '').split(',');
          const relayersId =
            role === RelayerRole.ASSIGNED
              ? assignedRelayersId
              : role === RelayerRole.DELIVERY
              ? deliveredRelayersId
              : confirmedRelayersId;

          const idx = (relayersId || []).findIndex((relayerId) => relayerId.split('-')[1] === relayerAddress);
          if (idx >= 0 && amounts?.length) {
            return acc.add(bnToBn(amounts[idx]));
          }
          return acc;
        },
        BN_ZERO
      ) || BN_ZERO;

    row.reward = row.reward.add(reward);

    previous.splice(idx, idx === -1 ? 0 : 1, row);
  }

  return previous;
};

// eslint-disable-next-line complexity
export const transformRelayerOrders = (
  relayerAddress: string,
  assignedOrders: { data: TOrderSimple }[],
  deliveredOrders: { data: TOrderSimple }[],
  confirmedOrders: { data: TOrderSimple }[],
  slashs?: { amount: string; blockTime: string; orderId: string; order: { createBlockTime: string } }[]
): RelayerOrdersDataSource[] => {
  let dataSource: RelayerOrdersDataSource[] = [];

  dataSource = assignedOrders.reduce(
    (acc, cur) => reduceOrder(acc, RelayerRole.ASSIGNED, relayerAddress, cur.data),
    dataSource
  );
  dataSource = deliveredOrders.reduce(
    (acc, cur) => reduceOrder(acc, RelayerRole.DELIVERY, relayerAddress, cur.data),
    dataSource
  );
  dataSource = confirmedOrders.reduce(
    (acc, cur) => reduceOrder(acc, RelayerRole.CONFIRMATION, relayerAddress, cur.data),
    dataSource
  );

  for (const slash of slashs || []) {
    const [, lane, nonce] = slash.orderId.split('-');
    const idx = dataSource.findIndex((item) => item.lane === lane && item.nonce.toString() === nonce);
    if (idx >= 0) {
      dataSource[idx].slash = bnToBn(slash.amount);
      const roles = new Set<RelayerRole>(dataSource[idx].relayerRoles);
      dataSource[idx].relayerRoles = Array.from(roles.add(RelayerRole.ASSIGNED));
    } else {
      dataSource.push({
        lane,
        nonce: Number(nonce),
        createBlockTime: slash.order.createBlockTime,
        reward: BN_ZERO,
        slash: new BN(slash.amount),
        relayerRoles: [RelayerRole.ASSIGNED],
      });
    }
  }

  return dataSource.sort((a, b) => compareDesc(new Date(a.createBlockTime), new Date(b.createBlockTime)));
};

export const transformTotalOrdersOverview = (data: TTotalOrderOverview): [number, number][] => {
  const datesOrders =
    data.orders?.nodes.reduce((acc, { createBlockTime }) => {
      const date = `${createBlockTime.split('T')[0]}Z`;
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

  return Object.keys(datesOrders).map((date) => [new Date(date).getTime(), datesOrders[date]]);
};