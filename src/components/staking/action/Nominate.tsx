import Identicon from '@polkadot/react-identicon';
import { Button, Select } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useApi, useStaking } from '../../../hooks';
import { STAKING_FAV_KEY, useFavorites } from '../../../hooks/favorites';
import { FormModal } from '../../modal/FormModal';
import { AccountName } from '../../widget/AccountName';
import { AddressItem } from '../../widget/form-control/AddressItem';
import { StakingActionProps } from './interface';

interface NominateFormValues {
  controller: string;
  stash: string;
  targets: string[];
  [key: string]: unknown;
}

export function Nominate({ label, type = 'text' }: StakingActionProps) {
  const { t } = useTranslation();
  const { api } = useApi();
  const { isControllerAccountOwner, isNominating } = useStaking();
  const [isVisible, setIsVisible] = useState(false);
  const { account } = useAccount();
  const { stashAccount, stakingDerive, stakingOverview, availableValidators, updateValidators, updateStakingDerive } =
    useStaking();
  const [favorites] = useFavorites(STAKING_FAV_KEY);

  const defaultSelected = useMemo(() => {
    return (stakingDerive && stakingDerive.nominators.map((item) => item.toString())) || [];
  }, [stakingDerive]);

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

  return !isNominating ? (
    <>
      <Button
        type={type}
        disabled={!isControllerAccountOwner}
        onClick={() => {
          setIsVisible(true);
        }}
      >
        {t(label ?? 'Nominate')}
      </Button>

      <FormModal<NominateFormValues>
        modalProps={{ visible: isVisible }}
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
        initialValues={{ controller: account, stash: stashAccount, targets: defaultSelected }}
      >
        <AddressItem name="controller" label="Controller account" disabled />
        <AddressItem name="stash" label="Stash account" disabled />

        <FormItem
          name="targets"
          label="Filter candidates"
          extra={
            <span className="text-xs">
              {t('Filter available candidates based on name, address or short account index.')}
            </span>
          }
          rules={[{ required: true }]}
        >
          <Select mode="multiple" allowClear placeholder="Please select" size="large">
            {available.map((item) => (
              <Select.Option key={item} value={item}>
                <div className="flex items-center gap-2">
                  <Identicon size={24} value={item} />
                  <AccountName account={item} />
                </div>
              </Select.Option>
            ))}
          </Select>
        </FormItem>
      </FormModal>
    </>
  ) : null;
}
