import { ApiPromise, SubmittableResult } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { Button, Tooltip } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QuestionCircleFilled } from '@ant-design/icons';
import { PayoutValidator, useApi, useStakingRewards, useAccount } from '../../../hooks';
import { useTx } from '../../../hooks/tx';
import { fromWei, prettyNumber, signAndSendExtrinsic } from '../../../utils';
import { SelectAccountModal } from '../../widget/account/SelectAccountModal';
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
  const {
    api,
    connection: { accounts },
  } = useApi();
  const { txProcessObserver, tx } = useTx();
  const { account } = useAccount();
  const { stakingRewards, payoutValidators } = useStakingRewards(eraSelectionIndex);
  const hasPayoutValidator = useMemo(() => payoutValidators && payoutValidators.length, [payoutValidators]);
  const [isVisible, setIsVisible] = useState(false);
  const [signer, setSigner] = useState(account);
  const loading = useMemo(() => !!tx && !(tx.status === 'finalized' || tx.status === 'error'), [tx]);

  useEffect(() => {
    if (tx?.status === 'finalized') {
      setIsVisible(false);
    }
  }, [tx]);

  return (
    <>
      <Tooltip
        title={
          stakingRewards.payoutEras.length
            ? t('Unclaimed {{amount}}', { amount: fromWei({ value: stakingRewards.payoutTotal }, prettyNumber) })
            : ''
        }
      >
        <Button type={type} disabled={!hasPayoutValidator} onClick={() => setIsVisible(true)}>
          <span>{t('Claim Reward')}</span>
        </Button>
      </Tooltip>
      <SelectAccountModal
        visible={isVisible}
        defaultValue={account}
        onCancel={() => setIsVisible(false)}
        onSelect={(acc) => {
          setSigner(acc);
        }}
        title={
          <div className="inline-flex items-center space-x-1">
            <span>{t('Select a signer')}</span>
            <Tooltip
              title={`If your account in the old version cannot be found in your wallet, you can restore JSON which the account in the old version Apps through "Account Migration" and add the JSON to polkadot{.js}.`}
            >
              <QuestionCircleFilled className="cursor-pointer text-gray-400" />
            </Tooltip>
          </div>
        }
        footer={
          accounts?.length
            ? [
                <Button
                  key="primary-btn"
                  type="primary"
                  size="large"
                  loading={loading}
                  onClick={() => {
                    const extrinsic = createPayout(api, payoutValidators);
                    signAndSendExtrinsic(api, signer, extrinsic).subscribe(txProcessObserver);
                  }}
                  className="block mx-auto w-full border-none rounded-lg"
                >
                  {t('Confirm')}
                </Button>,
              ]
            : null
        }
      />
    </>
  );
}
