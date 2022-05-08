import { ApiPromise, SubmittableResult } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { Button, Tooltip } from 'antd';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QuestionCircleFilled } from '@ant-design/icons';
import { PayoutValidator, useApi, useStakingRewards, useAccount, useQueue } from '../../../hooks';
import { fromWei, prettyNumber } from '../../../utils';
import { SelectAccountModal } from '../../widget/account/SelectAccountModal';
import { StakingActionProps } from './interface';

interface ClaimRewardsProps extends StakingActionProps {
  eraSelectionIndex: number;
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

export function ClaimRewards({ eraSelectionIndex, type = 'text' }: ClaimRewardsProps) {
  const { t } = useTranslation();
  const {
    api,
    connection: { accounts },
  } = useApi();
  const { queueExtrinsic } = useQueue();
  const { account } = useAccount();
  const { stakingRewards, payoutValidators } = useStakingRewards(eraSelectionIndex);
  const hasPayoutValidator = useMemo(() => payoutValidators && payoutValidators.length, [payoutValidators]);
  const [busy, setBusy] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [signer, setSigner] = useState(account);

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
                  loading={busy}
                  onClick={() => {
                    const extrinsics = createPayout(api, payoutValidators);
                    extrinsics.forEach((extrinsic, index) => {
                      setBusy(true);
                      queueExtrinsic({
                        signer,
                        extrinsic,
                        txFailedCb: () => {
                          if (index + 1 === extrinsics.length) {
                            setBusy(false);
                          }
                        },
                        txSuccessCb: () => {
                          if (index + 1 === extrinsics.length) {
                            setIsVisible(false);
                            setBusy(false);
                          }
                        },
                      });
                    });
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
