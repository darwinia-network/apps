import { ApiPromise, SubmittableResult } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { Button, Tooltip } from 'antd';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PayoutValidator, useApi, useStaking, useStakingRewards } from '../../../hooks';
import { useTx } from '../../../hooks/tx';
import { fromWei, prettyNumber, signAndSendExtrinsic } from '../../../utils';
import { StakingActionProps } from './interface';

interface ClaimRewardsProps extends StakingActionProps {
  eraSelectionIndex: number;
}

const PAYOUT_MAX_AMOUNT = 30;

const createPayout = (
  api: ApiPromise,
  payout: PayoutValidator | PayoutValidator[]
): SubmittableExtrinsic<'promise', SubmittableResult> => {
  if (Array.isArray(payout)) {
    if (payout.length === 1) {
      return createPayout(api, payout[0]);
    }

    const callList = payout.reduce(
      (calls: SubmittableExtrinsic<'promise'>[], { eras, validatorId }): SubmittableExtrinsic<'promise'>[] =>
        calls.concat(...eras.map(({ era }) => api.tx.staking.payoutStakers(validatorId, era))),
      []
    );

    if (callList.length > PAYOUT_MAX_AMOUNT) {
      callList.length = PAYOUT_MAX_AMOUNT;
    }

    return api.tx.utility.batch(callList);
  }

  const { eras, validatorId } = payout;

  const limitEras = eras.slice(0, PAYOUT_MAX_AMOUNT);

  return eras.length === 1
    ? api.tx.staking.payoutStakers(validatorId, eras[0].era)
    : api.tx.utility.batch(limitEras.map(({ era }) => api.tx.staking.payoutStakers(validatorId, era)));
};

export function ClaimRewards({ eraSelectionIndex, type = 'text' }: ClaimRewardsProps) {
  const { t } = useTranslation();
  const { api } = useApi();
  const { controllerAccount } = useStaking();
  const { txProcessObserver } = useTx();
  const { stakingRewards, payoutValidators } = useStakingRewards(eraSelectionIndex);
  const hasPayoutValidator = useMemo(() => payoutValidators && payoutValidators.length, [payoutValidators]);

  return (
    <Tooltip
      title={
        stakingRewards.payoutEras.length
          ? t('Unclaimed {{amount}}', { amount: fromWei({ value: stakingRewards.payoutTotal }, prettyNumber) })
          : ''
      }
    >
      <Button
        type={type}
        disabled={!hasPayoutValidator}
        onClick={() => {
          const extrinsic = createPayout(api, payoutValidators);

          signAndSendExtrinsic(api, controllerAccount, extrinsic).subscribe(txProcessObserver);
        }}
      >
        <span>{t('Claim Reward')}</span>
      </Button>
    </Tooltip>
  );
}
