import { Button } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi, useStaking } from '../../../hooks';
import { FormModal } from '../../widget/FormModal';
import { AddressItem } from '../../widget/form-control/AddressItem';
import { Label } from '../../widget/form-control/Label';
import { Payee } from '../../widget/form-control/PayeeControl';
import { PayeeItem } from '../../widget/form-control/PayeeItem';

interface SetPayeeFormValues {
  controller: string;
  payee: Payee;
  [key: string]: unknown;
}

export function SetPayee() {
  const { t } = useTranslation();
  const { api } = useApi();
  const [isVisible, setIsVisible] = useState(false);
  const { controllerAccount, updateValidators, updateStakingDerive, isControllerAccountOwner, stashAccount } =
    useStaking();

  return (
    <>
      <Button type="text" disabled={!isControllerAccountOwner} onClick={() => setIsVisible(true)}>
        {t('Change reward destination')}
      </Button>

      <FormModal<SetPayeeFormValues>
        modalProps={{ visible: isVisible, title: t('Bonding preferences') }}
        onCancel={() => setIsVisible(false)}
        extrinsic={(values) => {
          const {
            payee: { type, account },
          } = values;

          return api.tx.staking.setPayee(type === 'Account' ? { Account: account } : type);
        }}
        onSuccess={() => {
          setIsVisible(false);
          updateValidators();
          updateStakingDerive();
        }}
        initialValues={{ controller: controllerAccount, payee: { type: 'Staked', account: stashAccount } }}
      >
        <AddressItem
          name="controller"
          label={
            <Label
              text={t('Controller account')}
              info={t(
                'The controller is the account that will be used to control any nominating or validating actions. Should not match another stash or controller.'
              )}
            />
          }
          extra={null}
        />

        <PayeeItem
          label={
            <Label
              text={t('Payment destination')}
              info={t('The destination account for any payments as either a nominator or validator')}
            />
          }
          name="payee"
        />
      </FormModal>
    </>
  );
}
