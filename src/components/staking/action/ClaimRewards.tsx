import { ApiPromise } from '@polkadot/api';
import { Balance, EraIndex } from '@polkadot/types/interfaces';
import { Button } from 'antd';
import BN from 'bn.js';
import { useEffect, useMemo, useState } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import { from, zip } from 'rxjs';
import { useApi, useOwnEraReward, useStaking } from '../../../hooks';
import { fromWei } from '../../../utils';
import { StakingActionProps } from './interface';

interface EraSelection {
  value: number;
  text: string;
}

interface ClaimRewardsProps extends StakingActionProps {
  eraSelectionIndex: number;
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

export function ClaimRewards({ eraSelectionIndex }: ClaimRewardsProps) {
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
    reward: { rewards },
    payoutValidators,
  } = useOwnEraReward(eraSelection[eraSelectionIndex].value);
  const hasPayoutValidator = useMemo(() => payoutValidators && payoutValidators.length, [payoutValidators]);

  useEffect(() => {
    if (rewards && stashAccount) {
      const eras = rewards[stashAccount].map(({ era }): EraIndex => era);
      const total = rewards[stashAccount].reduce((result, { validators: val }) => {
        const eraTotalList: Balance[] = Object.keys(val).map((validatorId: string) => val[validatorId].value);
        const eraTotal = eraTotalList.reduce((acc, item) => acc.iadd(item), new BN(0));

        return result.iadd(eraTotal);
      }, new BN(0));

      setStakingRewards({ payoutEras: eras, payoutTotal: total });
    }
  }, [rewards, stashAccount]);

  useEffect(() => {
    const sub$$ = zip([from(api.derive.session.eraLength()), from(api.query.staking.historyDepth())]).subscribe(
      ([len, depth]) => {
        setEraSelectionOptions({ eraLength: len, historyDepth: depth });
      }
    );

    return sub$$.unsubscribe();
  }, [api]);

  return (
    <Button type="text" disabled={!hasPayoutValidator}>
      <span>{t('Claim Reward')}</span>
      {!!stakingRewards.payoutEras.length && <span>{fromWei({ value: stakingRewards.payoutTotal })}</span>}
    </Button>
  );
}
