import { Button } from 'antd';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useOwnEraReward, useStakingRewards } from '../../../hooks';
import { fromWei } from '../../../utils';
import { StakingActionProps } from './interface';

interface ClaimRewardsProps extends StakingActionProps {
  eraSelectionIndex: number;
}

export function ClaimRewards({ eraSelectionIndex }: ClaimRewardsProps) {
  const { t } = useTranslation();
  const { stakingRewards, eraSelection } = useStakingRewards(eraSelectionIndex);
  const { payoutValidators } = useOwnEraReward(eraSelection[eraSelectionIndex].value);
  const hasPayoutValidator = useMemo(() => payoutValidators && payoutValidators.length, [payoutValidators]);

  return (
    <Button type="text" disabled={!hasPayoutValidator}>
      <span>{t('Claim Reward')}</span>
      {!!stakingRewards.payoutEras.length && <span>{fromWei({ value: stakingRewards.payoutTotal })}</span>}
    </Button>
  );
}
