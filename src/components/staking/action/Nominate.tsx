import { Button, Select } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { combineLatest, map } from 'rxjs';
import { DeriveAccountInfo } from '@polkadot/api-derive/accounts/types';
import { useApi, useStaking, useIsAccountFuzzyMatch } from '../../../hooks';
import { STAKING_FAV_KEY, useFavorites } from '../../../hooks/favorites';
import { FormModal } from '../../widget/FormModal';
import { IdentAccountName } from '../../widget/account/IdentAccountName';
import { AddressItem } from '../../widget/form-control/AddressItem';
import { StakingActionProps } from './interface';

type AvailableState = {
  address: string;
  info: DeriveAccountInfo;
};

interface NominateFormValues {
  controller: string;
  stash: string;
  targets: string[];
  className?: string;
  [key: string]: unknown;
}

// eslint-disable-next-line complexity
export function Nominate({
  label,
  defaultSelects,
  disabled,
  type = 'text',
  className = '',
  size,
  ...rest
}: StakingActionProps & { defaultSelects?: string[] }) {
  const { t } = useTranslation();
  const { api } = useApi();
  const [isVisible, setIsVisible] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [available, setAvailable] = useState<AvailableState[]>([]);
  const {
    isInElection,
    stashAccount,
    stakingDerive,
    stakingOverview,
    controllerAccount,
    availableValidators,
    maxNominations,
    updateValidators,
    updateStakingDerive,
  } = useStaking();
  const isMatch = useIsAccountFuzzyMatch();
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

  const list = useMemo(
    () => available.filter((item) => isMatch(item.address, searchName, item.info)),
    [searchName, available, isMatch]
  );

  useEffect(() => {
    // ensure that the favorite is included in the list of stashes and  the nominee is not in our favorites
    const shortlist = [
      ...favorites.filter((acc): boolean => validators.includes(acc) || availableValidators.includes(acc)),
      ...(nominees || []).filter((acc): boolean => !favorites.includes(acc)),
    ];

    const addresses = [
      ...shortlist,
      ...validators.filter((acc): boolean => !shortlist.includes(acc)),
      ...availableValidators.filter((acc): boolean => !shortlist.includes(acc)),
    ];

    const sub$$ = combineLatest(addresses.map((address) => api.derive.accounts.info(address)))
      .pipe(
        map((infos) =>
          infos.reduce((acc, info, idx) => acc.concat({ address: addresses[idx], info }), [] as AvailableState[])
        )
      )
      .subscribe(setAvailable);

    return () => sub$$.unsubscribe();
  }, [api, favorites, availableValidators, nominees, validators]);

  return (
    <>
      <Button
        type={type}
        disabled={disabled || isInElection || !controllerAccount || !stashAccount}
        onClick={() => {
          setIsVisible(true);
        }}
        className={className}
        size={size}
        {...rest}
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
        initialValues={{
          controller: controllerAccount,
          stash: stashAccount,
          targets: defaultSelected,
        }}
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
          rules={[
            { required: true },
            {
              validator: (_, nominations: string[]) =>
                nominations.length > maxNominations ? Promise.reject() : Promise.resolve(),
              message: t('Max, {{max}} nominees', { max: maxNominations }),
            },
          ]}
        >
          <Select<string>
            mode="multiple"
            allowClear
            placeholder={t('Please select from list')}
            size="large"
            disabled={!!defaultSelects}
            filterOption={false}
            onSearch={setSearchName}
          >
            {list.map((item) => (
              <Select.Option key={item.address} value={item.address}>
                <IdentAccountName account={item.address} iconSize={24} />
              </Select.Option>
            ))}
          </Select>
        </FormItem>
      </FormModal>
    </>
  );
}
