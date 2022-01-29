import { Button } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi, useStaking } from '../../../hooks';
import { DarwiniaAsset, Fund } from '../../../model';
import { getUnit, toWei } from '../../../utils';
import { FormModal } from '../../modal/FormModal';
import { AddressItem } from '../../widget/form-control/AddressItem';
import { FundItem } from '../../widget/form-control/FundItem';
import { PromiseMonthItem } from '../../widget/form-control/PromiseMonthItem';
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
  const { isControllerAccountOwner } = useStaking();
  const { stashAccount, updateValidators, updateStakingDerive } = useStaking();
  const [selectedAsset, setSelectedAsset] = useState<Fund | null>(null);
  const [duration, setDuration] = useState(0);

  return (
    <>
      <Button onClick={() => setIsVisible(true)} disabled={!isControllerAccountOwner} type="text">
        {t('Lock extra')}
      </Button>

      <FormModal<DepositFormValues>
        modalProps={{ visible: isVisible, title: t('Deposit more funds') }}
        onCancel={() => setIsVisible(false)}
        createExtrinsic={(values) => {
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
        <AddressItem name="stash" label="Stash account" disabled />

        <FundItem
          label="Additional deposit funds"
          name="fund"
          onChange={setSelectedAsset}
          hiddenAssets={[DarwiniaAsset.kton]}
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
