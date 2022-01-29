import { Button } from 'antd';
import BN from 'bn.js';
import { pickBy } from 'lodash';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useApi, useOwnStashes, useStaking } from '../../../hooks';
import { Fund } from '../../../model';
import { fundParam, isSameAddress } from '../../../utils';
import { FormModal } from '../../modal/FormModal';
import { AddressItem } from '../../widget/form-control/AddressItem';
import { FundItem } from '../../widget/form-control/FundItem';

interface UnbondFormValues {
  controller: string;
  fund: Fund;
  [key: string]: unknown;
}

export function Unbond() {
  const { t } = useTranslation();
  const { api } = useApi();
  const [isVisible, setIsVisible] = useState(false);
  const { isControllerAccountOwner, controllerAccount } = useStaking();
  const { account } = useAccount();
  const { ownLedgers } = useOwnStashes();
  const max = useMemo(() => {
    const ledger = ownLedgers.find((item) => {
      const { stash } = item.unwrap();
      return isSameAddress(stash.toString(), account);
    });

    if (!ledger) {
      return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { active, activeKton } = ledger.unwrap();
    const ring = active.unwrap();
    const kton = activeKton.unwrap();
    const data = pickBy({ ring, kton }, (item: BN) => item.gt(new BN(0)));

    return Object.entries(data)
      .map(([key, value]: [string, BN]) => [key, value.toString()])
      .reduce((acc, cur) => ({ ...acc, [cur[0]]: cur[1] }), {});
  }, [account, ownLedgers]);

  return (
    <>
      <Button disabled={!isControllerAccountOwner} onClick={() => setIsVisible(true)} type="text">
        {t('Unbond funds')}
      </Button>

      <FormModal<UnbondFormValues>
        modalProps={{ visible: isVisible, title: t('Unbond') }}
        onCancel={() => setIsVisible(false)}
        createExtrinsic={(values) => {
          const { fund } = values;
          const param = fundParam(fund);

          return api.tx.staking.unbond(param);
        }}
        onSuccess={() => {
          setIsVisible(false);
        }}
        initialValues={{ controller: controllerAccount }}
      >
        <AddressItem label="Controller account" name="controller" disabled />

        <FundItem label="Additional bond funds" name="fund" extra={null} max={max} />
      </FormModal>
    </>
  );
}
