import { Button } from 'antd';
import { upperCase } from 'lodash';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useApi, useStaking } from '../../../hooks';
import { Fund } from '../../../model';
import { fromWei, getUnit, isKton, isRing, toWei } from '../../../utils';
import { AddressItem } from '../../widget/form-control/AddressItem';
import { FundItem } from '../../widget/form-control/FundItem';
import { Label } from '../../widget/form-control/Label';
import { PromiseMonthItem } from '../../widget/form-control/PromiseMonthItem';
import { FormModal } from '../../widget/FormModal';
import { KtonReward } from '../power/KtonReward';
import type { StakingActionProps } from './interface';

interface DepositFormValues {
  stash: string;
  controller: string;
  fund: Fund;
  promiseMonth: number;
  [key: string]: unknown;
}

export function Deposit({ type = 'text', className = '', size }: StakingActionProps) {
  const { t } = useTranslation();
  const { api } = useApi();
  const [isVisible, setIsVisible] = useState(false);
  const { isControllerAccountOwner, stakingDerive } = useStaking();
  const { stashAccount, updateValidators, updateStakingDerive } = useStaking();
  const [selectedAsset, setSelectedAsset] = useState<Fund | null>(null);
  const [duration, setDuration] = useState(1);
  const { assets } = useAccount();

  const max = useMemo(() => {
    let ring = '0';
    const stakingLedger = stakingDerive?.stakingLedger;
    if (stakingLedger) {
      const locked = stakingLedger.activeDepositRing.toBn();

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const bondedRing = (stakingLedger.active || stakingLedger.activeRing).toBn().sub(locked);

      ring = bondedRing.toString();
    }
    return { ring };
  }, [stakingDerive]);

  return (
    <>
      <Button
        onClick={() => setIsVisible(true)}
        disabled={!isControllerAccountOwner}
        type={type}
        className={className}
        size={size}
      >
        {t('Lock extra')}
      </Button>

      <FormModal<DepositFormValues>
        modalProps={{
          visible: isVisible,
          title: <Label text={t('Deposit more funds')} info={t('Add lock limit for bonded tokens')} />,
        }}
        onCancel={() => setIsVisible(false)}
        extrinsic={(values) => {
          const { promiseMonth, fund } = values;

          return api.tx.staking.depositExtra(
            toWei({ value: fund.amount, unit: getUnit(+fund.token.decimal) }),
            promiseMonth
          );
        }}
        onSuccess={() => {
          setIsVisible(false);
          updateValidators();
          updateStakingDerive();
        }}
        initialValues={{ stash: stashAccount, promiseMonth: duration, accept: false }}
      >
        <AddressItem
          name="stash"
          label="Stash account"
          disabled
          extra={
            <span className="inline-flex items-center gap-2 text-xs">
              <span>{t('Bonded')}: </span>
              <span>
                <span>{fromWei({ value: max.ring.toString() })}</span>
                <span>{upperCase(assets.find((item) => isRing(item.token.symbol))?.token.symbol ?? 'ring')}</span>
              </span>
            </span>
          }
        />

        <FundItem
          label={
            <Label
              text={t('Additional deposit funds')}
              info={t(
                'Amount to add to the currently deposit funds. This is adjusted using the bonded funds on the account.'
              )}
            />
          }
          name="fund"
          onChange={setSelectedAsset}
          hiddenAssets={(asset) => isKton(asset.token.symbol)}
          max={max}
        />

        <PromiseMonthItem
          label="Lock limit"
          name="promiseMonth"
          selectedAsset={selectedAsset}
          forcePromise={true}
          duration={duration}
          onChange={(value) => setDuration(+value)}
        />

        <KtonReward selectedAsset={selectedAsset} promiseMonth={duration} />
      </FormModal>
    </>
  );
}
