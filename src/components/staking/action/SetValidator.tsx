import { Button, InputNumber } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import { BN } from '@polkadot/util';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi, useStaking } from '../../../hooks';
import { useValidatorPrefs } from '../../../hooks/staking';
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

// eslint-disable-next-line complexity
export function SetValidator({ disabled, label, type = 'text', className = '', size }: StakingActionProps) {
  const { t } = useTranslation();
  const { api } = useApi();
  const { isInElection, controllerAccount, stashAccount } = useStaking();
  const { validatorPrefs } = useValidatorPrefs(stashAccount);
  const [isVisible, setIsVisible] = useState(false);

  const btnText = useMemo(() => t(label ?? 'Change validator preferences'), [t, label]);

  return (
    <>
      <Button
        disabled={disabled || isInElection || !controllerAccount || !stashAccount}
        type={type}
        onClick={() => setIsVisible(true)}
        className={className}
        size={size}
      >
        {btnText}
      </Button>
      <FormModal<SetValidatorFormValues>
        modalProps={{ visible: isVisible, title: t('Validator preferences') }}
        onCancel={() => setIsVisible(false)}
        extrinsic={(values) => {
          const { percentage } = values;
          const commission = new BN(percentage).mul(new BN(COMM_MUL));

          return api.tx.staking.validate({ commission, blocked: false });
        }}
        onSuccess={() => {
          setIsVisible(false);
        }}
        signer={controllerAccount}
        initialValues={{
          stash: stashAccount || undefined,
          controller: controllerAccount || undefined,
          percentage: (validatorPrefs?.commission.unwrap().toNumber() ?? 0) / COMM_MUL,
        }}
      >
        <AddressItem name="stash" label="Stash account" disabled />
        <AddressItem name="controller" label="Controller account" disabled />

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
              required: true,
            },
            { type: 'number', min: 0, max: 100 },
          ]}
        >
          <InputNumber size="large" step={1} className="w-full" />
        </FormItem>
      </FormModal>
    </>
  );
}
