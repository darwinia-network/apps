import { Button } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi, useStaking, useAccount } from '../../../hooks';
import { FormModal } from '../../widget/FormModal';
import { AddressItem } from '../../widget/form-control/AddressItem';
import { Label } from '../../widget/form-control/Label';
import { validateController } from '../../../utils';
interface SetControllerFormValues {
  stash: string;
  controller: string;
  [key: string]: unknown;
}

export function SetController() {
  const { t } = useTranslation();
  const { api } = useApi();
  const { account } = useAccount();
  const [isVisible, setIsVisible] = useState(false);
  const { stashAccount, controllerAccount, updateValidators, updateStakingDerive, updateControllerAndStash } =
    useStaking();

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
          updateControllerAndStash();
          updateValidators();
          updateStakingDerive();
        }}
        initialValues={{ controller: controllerAccount, stash: stashAccount }}
      >
        <AddressItem name="stash" label="Stash account" disabled extra={null} />

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
          rules={[
            {
              validator(_, value) {
                return validateController(api, t, account, value, controllerAccount);
              },
            },
          ]}
        />
      </FormModal>
    </>
  );
}
