import { ApiPromise, SubmittableResult } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { Button, Tooltip } from 'antd';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PayoutValidator,
  useApi,
  useStakingRewards,
  useWallet,
  useQueue,
  useAccount,
  useStaking,
} from '../../../hooks';
import { fromWei, prettyNumber } from '../../../utils';
import { SelectAccountModal } from '../../widget/account/SelectAccountModal';
import type { StakingActionProps } from './interface';

interface ClaimRewardsProps extends StakingActionProps {
  eraSelectionIndex: number;
  onSuccess?: () => void;
}

const PAYOUT_MAX_AMOUNT = 30;

const createPayout = (
  api: ApiPromise,
  payout: PayoutValidator | PayoutValidator[]
): SubmittableExtrinsic<'promise', SubmittableResult>[] => {
  const payouts = Array.isArray(payout) ? payout : [payout];

  const callList = payouts.reduce(
    (calls: SubmittableExtrinsic<'promise'>[], { eras, validatorId }): SubmittableExtrinsic<'promise'>[] =>
      calls.concat(...eras.map(({ era }) => api.tx.staking.payoutStakers(validatorId, era))),
    []
  );

  if (callList.length === 1) {
    return callList;
  } else {
    const batchList: SubmittableExtrinsic<'promise', SubmittableResult>[] = [];
    while (callList.length) {
      batchList.push(api.tx.utility.batch(callList.splice(0, PAYOUT_MAX_AMOUNT)));
    }

    return batchList;
  }
};

export function ClaimRewards({
  eraSelectionIndex,
  onSuccess = () => undefined,
  type = 'text',
  className = '',
  size,
}: ClaimRewardsProps) {
  const { t } = useTranslation();
  const { api } = useApi();
  const { accounts } = useWallet();
  const { queueExtrinsic } = useQueue();
  const { account } = useAccount();
  const { updateStakingDerive } = useStaking();
  const { stakingRewards, payoutValidators, isLoadingRewards, refresh } = useStakingRewards(eraSelectionIndex);
  const hasPayoutValidator = useMemo(() => payoutValidators && payoutValidators.length, [payoutValidators]);
  const [busy, setBusy] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [signer, setSigner] = useState(account?.displayAddress);

  return (
    <>
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
          loading={isLoadingRewards}
          onClick={() => setIsVisible(true)}
          className={className}
          size={size}
        >
          <span>{t('Claim Reward')}</span>
        </Button>
      </Tooltip>
      <SelectAccountModal
        visible={isVisible}
        value={account?.displayAddress}
        onCancel={() => setIsVisible(false)}
        onSelect={(acc) => {
          setSigner(acc);
        }}
        footer={
          accounts?.length
            ? [
                <Button
                  key="primary-btn"
                  type="primary"
                  size="large"
                  loading={busy}
                  onClick={async () => {
                    if (signer) {
                      const extrinsics = createPayout(api, payoutValidators);
                      const nonce = (await api.rpc.system.accountNextIndex(signer)).toNumber();

                      extrinsics.forEach((extrinsic, index) => {
                        setBusy(true);
                        queueExtrinsic({
                          extrinsic,
                          signAddress: signer,
                          nonce: nonce + index,
                          txFailedCb: () => {
                            if (index + 1 >= extrinsics.length) {
                              setBusy(false);
                            }
                          },
                          txSuccessCb: () => {
                            if (index + 1 >= extrinsics.length) {
                              onSuccess();
                              refresh();
                              updateStakingDerive();
                              setIsVisible(false);
                              setBusy(false);
                            }
                          },
                        });
                      });
                    }
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
