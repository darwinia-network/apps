import { Button, Select } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi, useStaking } from '../../../hooks';
import { STAKING_FAV_KEY, useFavorites } from '../../../hooks/favorites';
import { FormModal } from '../../widget/FormModal';
import { IdentAccountName } from '../../widget/account/IdentAccountName';
import { AddressItem } from '../../widget/form-control/AddressItem';
import { StakingActionProps } from './interface';

interface NominateFormValues {
  controller: string;
  stash: string;
  targets: string[];
  className?: string;
  [key: string]: unknown;
}

export function Nominate({
  label,
  defaultSelects,
  disabled,
  type = 'text',
  ...rest
}: StakingActionProps & { defaultSelects?: string[] }) {
  const { t } = useTranslation();
  const { api } = useApi();
  const [isVisible, setIsVisible] = useState(false);
  const {
    isInElection,
    stashAccount,
    stakingDerive,
    stakingOverview,
    controllerAccount,
    availableValidators,
    updateValidators,
    updateStakingDerive,
  } = useStaking();
  const [favorites] = useFavorites(STAKING_FAV_KEY);

  const defaultSelected = useMemo(
    () => defaultSelects || (stakingDerive && stakingDerive.nominators.map((item) => item.toString())) || [],
    [stakingDerive, defaultSelects]
  );

  const validators = useMemo(
    () => (stakingOverview && stakingOverview.validators.map((item) => item.toString())) || [],
    [stakingOverview]
  );

  const nominees = useMemo(
    () => (stakingDerive && stakingDerive.nominators.map((item) => item.toString())) || [],
    [stakingDerive]
  );

  const [available, setAvailable] = useState<string[]>([]);

  useEffect(() => {
    // ensure that the favorite is included in the list of stashes and  the nominee is not in our favorites
    const shortlist = [
      ...favorites.filter((acc): boolean => validators.includes(acc) || availableValidators.includes(acc)),
      ...(nominees || []).filter((acc): boolean => !favorites.includes(acc)),
    ];

    setAvailable([
      ...shortlist,
      ...validators.filter((acc): boolean => !shortlist.includes(acc)),
      ...availableValidators.filter((acc): boolean => !shortlist.includes(acc)),
    ]);
  }, [favorites, availableValidators, nominees, validators]);

  return (
    <>
      <Button
        type={type}
        {...rest}
        disabled={disabled || isInElection || !controllerAccount || !stashAccount}
        onClick={() => {
          setIsVisible(true);
        }}
      >
        {t(label ?? 'Nominate')}
      </Button>

      <FormModal<NominateFormValues>
        modalProps={{ visible: isVisible, title: t('Nominate validators') }}
        onCancel={() => setIsVisible(false)}
        extrinsic={(values) => {
          const { targets } = values;

          return api.tx.staking.nominate(targets);
        }}
        onSuccess={() => {
          setIsVisible(false);
          updateValidators();
          updateStakingDerive();
        }}
        signer={controllerAccount}
        initialValues={{ controller: controllerAccount, stash: stashAccount, targets: defaultSelected }}
      >
        <AddressItem name="controller" label="Controller account" disabled={!defaultSelects} />
        <AddressItem name="stash" label="Stash account" disabled />

        <FormItem
          name="targets"
          label={t('Filter candidates')}
          extra={
            <span className="text-xs">
              {t('Filter available candidates based on name, address or short account index.')}
            </span>
          }
          rules={[{ required: true }]}
        >
          <Select
            mode="multiple"
            allowClear
            placeholder={t('Please select from list')}
            size="large"
            disabled={!!defaultSelects}
          >
            {available.map((item) => (
              <Select.Option key={item} value={item}>
                <IdentAccountName account={item} iconSize={24} />
              </Select.Option>
            ))}
          </Select>
        </FormItem>
      </FormModal>
    </>
  );
}
