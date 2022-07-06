import { Button } from 'antd';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { from, EMPTY } from 'rxjs';
import { RewardDestination } from '@polkadot/types/interfaces';
import { useApi, useStaking, useIsMountedOperator } from '../../../hooks';
import { FormModal } from '../../widget/FormModal';
import { AddressItem } from '../../widget/form-control/AddressItem';
import { Label } from '../../widget/form-control/Label';
import { Payee, PayeeType } from '../../widget/form-control/PayeeControl';
import { PayeeItem } from '../../widget/form-control/PayeeItem';
import type { StakingActionProps } from './interface';

interface SetPayeeFormValues {
  controller: string;
  payee: Payee;
  [key: string]: unknown;
}

export function SetPayee({ type = 'text', className = '', size }: StakingActionProps) {
  const { t } = useTranslation();
  const { api } = useApi();
  const [isVisible, setIsVisible] = useState(false);
  const [destination, setDestination] = useState<RewardDestination>();
  const { controllerAccount, updateValidators, updateStakingDerive, isControllerAccountOwner, stashAccount } =
    useStaking();
  const { takeWhileIsMounted } = useIsMountedOperator();

  const updateDestination = useCallback(() => {
    if (stashAccount) {
      return from(api.derive.staking.account(stashAccount))
        .pipe(takeWhileIsMounted())
        .subscribe((value) => setDestination(value.rewardDestination));
    } else {
      return EMPTY.subscribe();
    }
  }, [api, stashAccount, takeWhileIsMounted]);

  useEffect(() => {
    const sub$$ = updateDestination();
    return () => sub$$.unsubscribe();
  }, [updateDestination]);

  return (
    <>
      <Button
        type={type}
        disabled={!isControllerAccountOwner}
        onClick={() => setIsVisible(true)}
        className={className}
        size={size}
      >
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
          updateDestination();
        }}
        signer={controllerAccount}
        initialValues={{
          controller: controllerAccount,
          payee: destination
            ? destination.isAccount
              ? { type: 'Account', account: destination.asAccount.toString() }
              : { type: destination.toString() as PayeeType, account: '' }
            : stashAccount
            ? { type: 'Staked', account: stashAccount }
            : undefined,
        }}
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
          disabled
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
