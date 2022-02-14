import { DeriveBalancesAll } from '@polkadot/api-derive/types';
import { Button } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from } from 'rxjs';
import { useApi, useStaking } from '../../../hooks';
import { Fund } from '../../../model';
import { fundParam } from '../../../utils';
import { FormModal } from '../../widget/FormModal';
import { AddressItem } from '../../widget/form-control/AddressItem';
import { FundItem } from '../../widget/form-control/FundItem';
import { Label } from '../../widget/form-control/Label';
import { PromiseMonthItem } from '../../widget/form-control/PromiseMonthItem';
import { PowerReward } from '../power/PowerReward';

interface BondMoreFormValues {
  stash: string;
  controller: string;
  fund: Fund;
  promiseMonth: number;
  [key: string]: unknown;
}

export function BondMore() {
  const { t } = useTranslation();
  const { api } = useApi();
  const [isVisible, setIsVisible] = useState(false);
  const { stashAccount, updateValidators, updateStakingDerive } = useStaking();
  const [balances, setBalances] = useState<DeriveBalancesAll | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Fund | null>(null);
  const hasFreeBalance = useMemo(() => balances && balances.freeBalance.gtn(0), [balances]);

  useEffect(() => {
    const sub$$ = from(api.derive.balances.all(stashAccount)).subscribe((res) => {
      setBalances(res);
    });

    return () => sub$$.unsubscribe();
  }, [api, stashAccount]);

  return hasFreeBalance ? (
    <>
      <Button onClick={() => setIsVisible(true)} type="text">
        {t('Bond more funds')}
      </Button>

      <FormModal<BondMoreFormValues>
        modalProps={{ visible: isVisible, title: t('Bond more funds') }}
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
        }}
        initialValues={{ stash: stashAccount, promiseMonth: 0, accept: false }}
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

        <PromiseMonthItem label="Lock limit" name="promiseMonth" selectedAsset={selectedAsset} />

        <PowerReward selectedAsset={selectedAsset} />
      </FormModal>
    </>
  ) : null;
}
