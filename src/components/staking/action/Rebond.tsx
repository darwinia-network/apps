import { Button } from 'antd';
import BN from 'bn.js';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi, useStaking } from '../../../hooks';
import { Fund } from '../../../model';
import { getUnit, isRing, toWei } from '../../../utils';
import { FormModal } from '../../modal/FormModal';
import { AddressItem } from '../../widget/form-control/AddressItem';
import { FundItem } from '../../widget/form-control/FundItem';

interface RebondFormValues {
  stash: string;
  fund: Fund;
  [key: string]: unknown;
}

export function Rebond() {
  const { t } = useTranslation();
  const { api } = useApi();
  const [isVisible, setIsVisible] = useState(false);
  const { stashAccount, updateValidators, updateStakingDerive } = useStaking();

  return (
    <>
      <Button type="text" onClick={() => setIsVisible(true)}>
        {t('Rebond funds')}
      </Button>

      <FormModal<RebondFormValues>
        modalProps={{ visible: isVisible, title: t('Rebond funds') }}
        onCancel={() => setIsVisible(false)}
        extrinsic={(values) => {
          const { fund } = values;
          const value = toWei({ value: fund.amount, unit: getUnit(+fund.token.decimal) });
          const params = isRing(fund.asset) ? [value, new BN(0)] : [new BN(0), value];

          return api.tx.staking.rebond(...params);
        }}
        onSuccess={() => {
          setIsVisible(false);
          updateValidators();
          updateStakingDerive();
        }}
        initialValues={{ stash: stashAccount }}
      >
        <AddressItem name="stash" label="Stash account" disabled />

        <FundItem label="Amount" name="fund" extra={null} />
      </FormModal>
    </>
  );
}
