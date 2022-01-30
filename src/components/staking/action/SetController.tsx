import { Button } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi, useStaking } from '../../../hooks';
import { FormModal } from '../../modal/FormModal';
import { AddressItem } from '../../widget/form-control/AddressItem';
import { Label } from '../../widget/form-control/Label';
interface SetControllerFormValues {
  stash: string;
  controller: string;
  [key: string]: unknown;
}

export function SetController() {
  const { t } = useTranslation();
  const { api } = useApi();
  const [isVisible, setIsVisible] = useState(false);
  const { stashAccount, controllerAccount, updateValidators, updateStakingDerive } = useStaking();

  return (
    <>
      <Button onClick={() => setIsVisible(true)} type="text">
        {t('Change controller account')}
      </Button>

      <FormModal<SetControllerFormValues>
        modalProps={{ visible: isVisible, title: t('Change controller account') }}
        onCancel={() => setIsVisible(false)}
        extrinsic={(values) => {
          const { controller } = values;

          return api.tx.staking.setController(controller);
        }}
        onSuccess={() => {
          setIsVisible(false);
          updateValidators();
          updateStakingDerive();
        }}
        initialValues={{ controller: controllerAccount, stash: stashAccount }}
      >
        <AddressItem name="stash" label="Stash account" disabled />

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
        />
      </FormModal>
    </>
  );
}
