import { format, compareAsc } from 'date-fns';
import { BN } from '@polkadot/util';

import { DATE_FORMAT } from '../../config';
import { prettyNumber, fromWei } from '..';
import { RelayerRewardsAndSlashsData, RewardsAndSlashsState } from '../../model';

const reduceDatesAndAmount = (previous: Record<string, BN>, time: string, amount: string) => {
  const day = format(new Date(time), DATE_FORMAT);
  previous[day] = previous[day] ? previous[day].add(new BN(amount)) : new BN(amount);
  return previous;
};

// eslint-disable-next-line complexity
export const transformRewardsAndSlashs = (data: RelayerRewardsAndSlashsData): RewardsAndSlashsState => {
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
      dates: datesRewardsAndSlashs,
      ...(datesRewardsAndSlashs.reduce(
        ({ slashs, rewards }, date) => {
          rewards.push(datesRewards[date] ? fromWei({ value: datesRewards[date] }, prettyNumber) : '0');
          slashs.push(datesSlashs[date] ? fromWei({ value: datesSlashs[date] }, prettyNumber) : '0');
          return { rewards, slashs };
        },
        { rewards: [], slashs: [] } as { rewards: string[]; slashs: string[] }
      ) || { rewards: [], slashs: [] }),
    };
  }

  return { dates: [], rewards: [], slashs: [] };
};
