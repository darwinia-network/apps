import { DeriveStakerReward } from '@polkadot/api-derive/types';
import { GenericAccountId, Option } from '@polkadot/types';
import { EraIndex, Balance } from '@polkadot/types/interfaces';
import { StakingLedger } from '@polkadot/types/interfaces/staking';
import BN from 'bn.js';
import { has } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { from, Subscription, takeWhile, zip } from 'rxjs';
import { NoNullFields } from '../model';
import { useApi } from './api';
import { useIsMounted } from './isMounted';

interface OwnReward {
  rewards: Record<string, DeriveStakerReward[]> | null;
  isLoadingRewards: boolean;
  rewardCount: number;
}

interface PayoutEraValidator {
  era: EraIndex;
  stashes: Record<string, Balance>;
}

interface PayoutValidator {
  available: BN;
  eras: PayoutEraValidator[];
  validator: string;
}

type IsInKeyring = boolean;

function getOwnReward(stashAccounts: string[], available: DeriveStakerReward[][]): NoNullFields<OwnReward> {
  const allRewards: Record<string, DeriveStakerReward[]> = {};

  stashAccounts.forEach((stashId, index): void => {
    allRewards[stashId] = available[index]?.filter(({ eraReward }) => !eraReward.isZero()) || [];
  });

  return {
    rewards: allRewards,
    isLoadingRewards: false,
    rewardCount: Object.values(allRewards).filter((rewards) => rewards && rewards.length !== 0).length,
  };
}

function getStashes(
  allAccounts: string[],
  ownBonded: Option<GenericAccountId>[],
  ownLedger: Option<StakingLedger>[]
): [string, IsInKeyring][] {
  const result: [string, IsInKeyring][] = [];

  ownBonded.forEach((value, index): void => {
    if (value.isSome) {
      result.push([allAccounts[index], true]);
    }
  });

  ownLedger.forEach((ledger): void => {
    if (ledger.isSome) {
      const stashId = ledger.unwrap().stash.toString();

      if (!result.some(([accountId]) => accountId === stashId)) {
        result.push([stashId, false]);
      }
    }
  });

  return result;
}

function rewardsGroupedByPayoutValidator(
  allRewards: Record<string, DeriveStakerReward[]>,
  stakerPayoutsAfter: BN
): PayoutValidator[] {
  return Object.entries(allRewards)
    .reduce((grouped: PayoutValidator[], [stashId, rewards]): PayoutValidator[] => {
      rewards
        .filter(({ era }) => era.gte(stakerPayoutsAfter))
        .forEach((reward): void => {
          Object.entries(reward.validators).forEach(([validatorId, { value }]): void => {
            const entry = grouped.find((item) => item.validator === validatorId);

            if (entry) {
              const eraEntry = entry.eras.find((item) => item.era.eq(reward.era));

              if (eraEntry) {
                eraEntry.stashes[stashId] = value;
              } else {
                entry.eras.push({
                  era: reward.era,
                  stashes: { [stashId]: value },
                });
              }

              entry.available = entry.available.add(value);
            } else {
              grouped.push({
                available: value,
                eras: [
                  {
                    era: reward.era,
                    stashes: { [stashId]: value },
                  },
                ],
                validator: validatorId,
              });
            }
          });
        });

      return grouped;
    }, [])
    .sort((a, b) => b.available.cmp(a.available));
}

export function useOwnStashes(): [string, IsInKeyring][] | undefined {
  const isMounted = useIsMounted();
  const {
    api,
    connection: { accounts },
  } = useApi();
  const [state, setState] = useState<[string, IsInKeyring][] | undefined>();

  useEffect(() => {
    const addresses = accounts.map((item) => item.address);
    let sub$$: Subscription;

    if (addresses.length) {
      sub$$ = zip([from(api.query.staking.bonded.multi(addresses)), from(api.query.staking.ledger.multi(addresses))])
        .pipe(takeWhile(() => isMounted))
        .subscribe(([bonded, ledger]) => {
          setState(getStashes(addresses, bonded, ledger));
        });
    }

    return () => sub$$?.unsubscribe();
  }, [accounts, api, isMounted]);

  return state;
}

export function useOwnStashIds(): string[] | undefined {
  const isMounted = useIsMounted();
  const ownStashes = useOwnStashes();
  const [stashIds, setStashIds] = useState<string[] | undefined>();

  useEffect((): void => {
    if (isMounted && ownStashes) {
      setStashIds(ownStashes.map(([stashId]) => stashId));
    }
  }, [isMounted, ownStashes]);

  return stashIds;
}

export function useOwnEraReward(maxEras?: number) {
  const { api } = useApi();
  const isMounted = useIsMounted();
  const stashIds = useOwnStashIds();
  const [filteredEras, setFilteredEras] = useState<EraIndex[]>([]);
  const stakerPayoutAfter = useMemo(
    () => (has(api.tx.staking, 'payoutStakers') ? new BN(0) : new BN('1000000000')),
    [api]
  );
  const [reward, setReward] = useState<OwnReward>({ rewardCount: 0, isLoadingRewards: true, rewards: null });
  const [payoutValidators, setPayoutValidators] = useState<PayoutValidator[]>([]);

  useEffect(() => {
    setReward({ rewards: null, isLoadingRewards: true, rewardCount: 0 });
  }, [maxEras]);

  useEffect(() => {
    const sub$$ = from(api.derive.staking.erasHistoric()).subscribe((eras) => {
      if (eras && maxEras) {
        setFilteredEras(eras.slice(-1 * maxEras));
      }
    });

    return () => sub$$.unsubscribe();
  }, [api, maxEras]);

  useEffect(() => {
    if (!stashIds) {
      return;
    }

    const sub$$ = from(api.derive.staking.stakerRewardsMultiEras(stashIds, filteredEras))
      .pipe(takeWhile(() => isMounted))
      .subscribe((res) => {
        const data = getOwnReward(stashIds, res);

        setReward(data);
        setPayoutValidators(rewardsGroupedByPayoutValidator(data.rewards, stakerPayoutAfter));
      });

    return () => sub$$?.unsubscribe();
  }, [api, filteredEras, isMounted, stakerPayoutAfter, stashIds]);

  return { reward, payoutValidators };
}
