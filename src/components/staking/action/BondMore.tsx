import { DeriveBalancesAll } from '@polkadot/api-derive/types';
import { Button } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from } from 'rxjs';
import { useApi, useStaking, useAccount } from '../../../hooks';
import { Fund } from '../../../model';
import { fundParam } from '../../../utils';
import { AddressItem } from '../../widget/form-control/AddressItem';
import { FundItem } from '../../widget/form-control/FundItem';
import { Label } from '../../widget/form-control/Label';
import { PromiseMonthItem } from '../../widget/form-control/PromiseMonthItem';
import { FormModal } from '../../widget/FormModal';
import { KtonReward } from '../power/KtonReward';
import { PowerReward } from '../power/PowerReward';
import type { StakingActionProps } from './interface';

interface BondMoreFormValues {
  stash: string;
  controller: string;
  fund: Fund;
  promiseMonth: number;
  [key: string]: unknown;
}

export function BondMore({ type = 'text', className = '', size }: StakingActionProps) {
  const { t } = useTranslation();
  const { api } = useApi();
  const [isVisible, setIsVisible] = useState(false);
  const { refreshAssets } = useAccount();
  const { stashAccount, updateValidators, updateStakingDerive } = useStaking();
  const [balances, setBalances] = useState<DeriveBalancesAll | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Fund | null>(null);
  const hasFreeBalance = useMemo(() => balances && balances.freeBalance.gtn(0), [balances]);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!stashAccount) {
      setBalances(null);
      return;
    }

    const sub$$ = from(api.derive.balances.all(stashAccount)).subscribe((res) => {
      setBalances(res);
    });

    return () => sub$$.unsubscribe();
  }, [api, stashAccount]);

  return (
    <>
      <Button
        onClick={() => setIsVisible(true)}
        type={type}
        disabled={!hasFreeBalance}
        className={className}
        size={size}
      >
        {t('Bond more funds')}
      </Button>

      <FormModal<BondMoreFormValues>
        modalProps={{
          visible: isVisible,
          title: <Label text={t('Bond more funds')} info={t('Adds bonded tokens for staking to obtain more power.')} />,
        }}
        onCancel={() => setIsVisible(false)}
        extrinsic={(values) => {
          const { promiseMonth, fund } = values;
          const param = fundParam(fund);

          return api.tx.staking.bondExtra(param, promiseMonth);
        }}
        onSuccess={() => {
          setIsVisible(false);
          updateValidators();
          updateStakingDerive();
          refreshAssets();
        }}
        signer={stashAccount}
        initialValues={{ stash: stashAccount, promiseMonth: duration, accept: false }}
      >
        <AddressItem name="stash" label="Stash account" disabled />

        <FundItem
          label={
            <Label
              text={t('Additional bond funds')}
              info={t(
                'Amount to add to the currently bonded funds. This is adjusted using the available funds on the account.'
              )}
            />
          }
          name="fund"
          onChange={setSelectedAsset}
        />

        <PromiseMonthItem
          label="Lock limit"
          name="promiseMonth"
          selectedAsset={selectedAsset}
          duration={duration}
          onChange={(value) => setDuration(value)}
        />

        <PowerReward selectedAsset={selectedAsset} />

        <KtonReward selectedAsset={selectedAsset} promiseMonth={duration} />
      </FormModal>
    </>
  );
}
