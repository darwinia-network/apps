import { ApiPromise } from '@polkadot/api';
import { EraIndex } from '@polkadot/types/interfaces';
import BN from 'bn.js';
import { TFunction } from 'i18next';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from, zip } from 'rxjs';
import { useApi } from '../api';
import { useStaking } from './staking';
import { useOwnEraReward } from './stash';

interface EraSelection {
  value: number;
  text: string;
}

// eslint-disable-next-line no-magic-numbers
const DAY_SECS = new BN(1000 * 60 * 60 * 24);

// eslint-disable-next-line complexity
function getOptions(
  api: ApiPromise,
  eraLength: BN | undefined,
  historyDepth: BN | undefined,
  t: TFunction
): EraSelection[] {
  if (eraLength && historyDepth) {
    const blocksPerDay = DAY_SECS.div(
      // eslint-disable-next-line no-magic-numbers
      api.consts.babe?.expectedBlockTime || api.consts.timestamp?.minimumPeriod.muln(2) || new BN(6000)
    );
    const maxBlocks = eraLength.mul(historyDepth);
    const eraSelection: EraSelection[] = [];
    let days = 2;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const dayBlocks = blocksPerDay.muln(days);

      if (dayBlocks.gte(maxBlocks)) {
        break;
      }

      eraSelection.push({
        text: t<string>('{{days}} days', { replace: { days } }),
        value: dayBlocks.div(eraLength).toNumber(),
      });

      // eslint-disable-next-line no-magic-numbers
      days = days * 3;
    }

    eraSelection.push({
      text: t<string>('Max, {{eras}} eras', { replace: { eras: historyDepth.toNumber() } }),
      value: historyDepth.toNumber(),
    });

    return eraSelection;
  }

  return [{ text: '', value: 0 }];
}

export function useStakingRewards(eraSelectionIndex: number) {
  const { t } = useTranslation();
  const { api } = useApi();
  const [eraSelectionOptions, setEraSelectionOptions] = useState({ eraLength: new BN(0), historyDepth: new BN(0) });
  const eraSelection = useMemo(
    () => getOptions(api, eraSelectionOptions.eraLength, eraSelectionOptions.historyDepth, t),
    [api, eraSelectionOptions, t]
  );
  const [stakingRewards, setStakingRewards] = useState<{ payoutEras: EraIndex[]; payoutTotal: BN }>({
    payoutEras: [],
    payoutTotal: new BN(0),
  });
  const { stashAccount } = useStaking();
  const {
    reward: { rewards, isLoadingRewards },
    payoutValidators,
  } = useOwnEraReward(eraSelection[eraSelectionIndex]?.value, stashAccount);

  useEffect(() => {
    if (rewards && stashAccount && rewards[stashAccount]) {
      const eras = rewards[stashAccount].map(({ era }): EraIndex => era);
      const total = rewards[stashAccount].reduce((result, { validators: val }) => {
        const eraTotal = Object.values(val)
          .map((item) => item.value)
          .reduce((acc, cur) => acc.iadd(cur), new BN(0));

        return result.iadd(eraTotal);
      }, new BN(0));

      setStakingRewards({ payoutEras: eras, payoutTotal: total });
    }
  }, [rewards, stashAccount]);

  useEffect(() => {
    const sub$$ = zip([
      from(api.derive.session.eraLength()),
      from<Promise<BN>>(api.query.staking.historyDepth()),
    ]).subscribe(([len, depth]) => {
      setEraSelectionOptions({ eraLength: len, historyDepth: depth });
    });

    return () => sub$$.unsubscribe();
  }, [api]);

  return { stakingRewards, eraSelection, isLoadingRewards, payoutValidators };
}
