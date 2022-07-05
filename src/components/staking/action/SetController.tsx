import { Button } from 'antd';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Option } from '@polkadot/types';
import type { AccountId, StakingLedger } from '@polkadot/types/interfaces';
import { useApi, useStaking, useAccount } from '../../../hooks';
import { FormModal } from '../../widget/FormModal';
import { AddressItem } from '../../widget/form-control/AddressItem';
import { Label } from '../../widget/form-control/Label';
import { validateController } from '../../../utils';
import type { StakingActionProps } from './interface';

interface SetControllerFormValues {
  stash: string;
  controller: string;
  [key: string]: unknown;
}

export function SetController({ type = 'text', className = '', size }: StakingActionProps) {
  const { t } = useTranslation();
  const { api } = useApi();
  const { account } = useAccount();
  const [isVisible, setIsVisible] = useState(false);
  const { stashAccount, controllerAccount, updateValidators, updateStakingDerive, refreshControllerAndStashAccount } =
    useStaking();

  const currentAccount = useMemo(() => account?.displayAddress || '', [account]);

  return (
    <>
      <Button onClick={() => setIsVisible(true)} type={type} className={className} size={size}>
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
          refreshControllerAndStashAccount();
          updateValidators();
          updateStakingDerive();
        }}
        initialValues={{ controller: controllerAccount || undefined, stash: stashAccount || undefined }}
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
              validator: async (_, value) => {
                if (value !== controllerAccount) {
                  const bonded = (await api.query.staking.bonded(value)) as Option<AccountId>;
                  const ledger = (await api.query.staking.ledger(value)) as Option<StakingLedger>;
                  const allBalances = await api.derive.balances?.all(value);
                  const bondedId = bonded.isSome ? bonded.unwrap().toString() : null;
                  const stashId = ledger.isSome ? ledger.unwrap().stash.toString() : null;

                  const message = validateController({
                    t,
                    bondedId,
                    stashId,
                    allBalances,
                    controllerId: value,
                    accountId: currentAccount,
                  });
                  return message ? Promise.reject(message) : Promise.resolve();
                }
              },
            },
          ]}
        />
      </FormModal>
    </>
  );
}
