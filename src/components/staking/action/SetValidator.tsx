import { Button, InputNumber } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import BN from 'bn.js';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi, useStaking } from '../../../hooks';
import { FormModal } from '../../widget/FormModal';
import { AddressItem } from '../../widget/form-control/AddressItem';
import { Label } from '../../widget/form-control/Label';
import { StakingActionProps } from './interface';

interface SetValidatorFormValues {
  stash: string;
  controller: string;
  percentage: number;
  [key: string]: unknown;
}

const COMM_MUL = 10000000;

export function SetValidator({ disabled, type = 'text' }: StakingActionProps) {
  const { t } = useTranslation();
  const { api } = useApi();
  const { isInElection, controllerAccount, stashAccount, isValidating } = useStaking();
  const [isVisible, setIsVisible] = useState(false);

  return isValidating ? (
    <>
      <Button
        disabled={disabled || isInElection || !controllerAccount || !stashAccount}
        type={type}
        onClick={() => setIsVisible(true)}
      >
        {t('Change validator preferences')}
      </Button>
      <FormModal<SetValidatorFormValues>
        modalProps={{ visible: isVisible, title: t('Bonding preferences') }}
        onCancel={() => setIsVisible(false)}
        extrinsic={(values) => {
          const { percentage } = values;
          const commission = new BN(percentage).mul(new BN(COMM_MUL));

          return api.tx.staking.validate([{ commission, blocked: false }]);
        }}
        onSuccess={() => {
          setIsVisible(false);
        }}
        signer={controllerAccount}
        initialValues={{
          stash: stashAccount,
          controller: controllerAccount,
          percentage: 1,
        }}
      >
        <AddressItem name="stash" label="Stash account" disabled={true} />
        <AddressItem name="controller" label="Controller account" disabled={true} />

        <FormItem
          name="percentage"
          label={
            <Label
              text={t('Reward commission percentage')}
              info={t('The percentage reward (0-100) that should be applied for the validator')}
            />
          }
          required
          rules={[
            {
              validator(_, val) {
                return val ? Promise.resolve() : Promise.reject();
              },
              message: t('Percentage is Required'),
            },
            { type: 'number', min: 0, max: 100 },
          ]}
        >
          <InputNumber size="large" step={1} className="w-full" />
        </FormItem>
      </FormModal>
    </>
  ) : null;
}
