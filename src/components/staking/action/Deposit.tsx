import { Button } from 'antd';
import { upperCase } from 'lodash';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useApi, useStaking } from '../../../hooks';
import { DarwiniaAsset, Fund } from '../../../model';
import { fromWei, getUnit, isRing, toWei } from '../../../utils';
import { AddressItem } from '../../widget/form-control/AddressItem';
import { FundItem } from '../../widget/form-control/FundItem';
import { Label } from '../../widget/form-control/Label';
import { PromiseMonthItem } from '../../widget/form-control/PromiseMonthItem';
import { FormModal } from '../../widget/FormModal';
import { KtonReward } from '../power/KtonReward';

interface DepositFormValues {
  stash: string;
  controller: string;
  fund: Fund;
  promiseMonth: number;
  [key: string]: unknown;
}

export function Deposit() {
  const { t } = useTranslation();
  const { api } = useApi();
  const [isVisible, setIsVisible] = useState(false);
  const { isControllerAccountOwner, stakingDerive } = useStaking();
  const { stashAccount, updateValidators, updateStakingDerive } = useStaking();
  const [selectedAsset, setSelectedAsset] = useState<Fund | null>(null);
  const [duration, setDuration] = useState(0);
  const { assets } = useAccount();

  const max = useMemo(() => {
    let ring = '0';
    const stakingLedger = stakingDerive?.stakingLedger;
    if (stakingLedger) {
      const locked = stakingLedger.activeDepositRing.toBn();

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const boundedRing = (stakingLedger.active || stakingLedger.activeRing).toBn().sub(locked);

      ring = boundedRing.toString();
    }
    return { ring };
  }, [stakingDerive]);

  return (
    <>
      <Button onClick={() => setIsVisible(true)} disabled={!isControllerAccountOwner} type="text">
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
        initialValues={{ stash: stashAccount, promiseMonth: 0, accept: false }}
      >
        <AddressItem
          name="stash"
          label="Stash account"
          disabled
          extra={
            <span className="inline-flex items-center gap-2 text-xs">
              <span>
                {t('Bounded {{amount}} {{symbol}}', {
                  amount: fromWei({ value: max.ring.toString() }),
                  symbol: upperCase(assets.find((item) => isRing(item.asset))?.token.symbol ?? 'ring'),
                })}
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
          hiddenAssets={[DarwiniaAsset.kton]}
          max={max}
        />

        <PromiseMonthItem
          label="Lock limit"
          name="promiseMonth"
          selectedAsset={selectedAsset}
          onChange={(value) => setDuration(+value)}
        />

        <KtonReward selectedAsset={selectedAsset} promiseMonth={duration} />
      </FormModal>
    </>
  );
}
