import { DeriveBalancesAll } from '@polkadot/api-derive/types';
import { Button } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from } from 'rxjs';
import { useApi, useStaking } from '../../../hooks';

export function BondMore() {
  const { t } = useTranslation();
  const { stashAccount } = useStaking();
  const { api } = useApi();
  const [balances, setBalances] = useState<DeriveBalancesAll | null>(null);
  const hasFreeBalance = useMemo(() => balances && balances.freeBalance.gtn(0), [balances]);

  useEffect(() => {
    const sub$$ = from(api.derive.balances.all(stashAccount)).subscribe((res) => {
      setBalances(res);
    });

    return () => sub$$.unsubscribe();
  }, [api, stashAccount]);

  return hasFreeBalance ? <Button type="text">{t('Bond more funds')}</Button> : null;
}
