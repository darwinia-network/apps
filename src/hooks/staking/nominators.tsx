import { Power } from '@darwinia/types';
import { BN_ZERO } from '@polkadot/util';
import BN from 'bn.js';
import { useEffect, useState } from 'react';
import { from, takeWhile } from 'rxjs';
import { useApi } from '../api';
import { useIsMounted } from '../isMounted';
import { useStaking } from './staking';

export function useNominators() {
  const {
    api,
    connection: { accounts },
  } = useApi();
  const { stashAccount } = useStaking();
  const [nominators, setNominators] = useState<[string, Power][] | null>(null);
  const isMounted = useIsMounted();

  useEffect(() => {
    const elected$$ = from(
      api.derive.staking.electedInfo({ withController: true, withExposure: true, withPrefs: true, withLedger: true })
    )
      .pipe(takeWhile(() => isMounted))
      .subscribe((derive) => {
        const { info } = derive;
        const all = accounts.map((item) => item.address);
        const data = info
          .map(({ exposure, accountId }) => {
            const result: Record<string, BN> = {};

            exposure.others.reduce((isNominating, cur) => {
              const nominator = cur.who.toString();

              result[nominator] = (result[nominator] || BN_ZERO).add(cur.value?.toBn() || BN_ZERO);

              return isNominating || all.includes(nominator);
            }, all.includes(accountId.toString()));

            return result;
          })
          .reduce((acc, cur) => ({ ...acc, ...cur }));

        setNominators(Object.entries(data) as [string, Power][]);
      });

    return () => {
      elected$$.unsubscribe();
    };
  }, [accounts, api, isMounted, stashAccount]);

  return { nominators };
}
