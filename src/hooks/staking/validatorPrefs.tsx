import { from, switchMap } from 'rxjs';
import type { ValidatorPrefs } from '@darwinia/types';
import { EraIndex } from '@polkadot/types/interfaces';
import { Option } from '@polkadot/types';
import { useState, useEffect } from 'react';
import { useApi } from '../../hooks';

export const useValidatorPrefs = (account?: string | null, eraIndex?: EraIndex) => {
  const { api } = useApi();
  const [validatorPrefs, setValidatorPrefs] = useState<ValidatorPrefs | null>(null);

  useEffect(() => {
    if (!account) {
      return;
    }

    const sub$$ = from(eraIndex ? Promise.resolve(eraIndex) : api.query.staking.currentEra())
      .pipe(
        switchMap((res) => {
          const index = eraIndex ?? (res as Option<EraIndex>).unwrap();

          return from(api.query.staking.erasValidatorPrefs(index, account));
        })
      )
      .subscribe((res) => setValidatorPrefs(res as ValidatorPrefs));

    return () => sub$$.unsubscribe();
  }, [api, account, eraIndex]);

  return { validatorPrefs };
};
