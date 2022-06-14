import { ExposureT, Power } from '@darwinia/types';
import { Option, StorageKey } from '@polkadot/types';
import { Nominations } from '@polkadot/types/interfaces';
import { DeriveStakingWaiting } from '@polkadot/api-derive/types';
import { BN_ZERO } from '@polkadot/util';
import type { BN } from '@polkadot/util';
import { useEffect, useState } from 'react';
import { from, takeWhile } from 'rxjs';
import { useIsMountedOperator } from '..';
import { useApi } from '../api';
import { useWallet } from '../wallet';
import { useIsMounted } from '../isMounted';
import { IDeriveStakingElected } from '../../api-derive';

function extractNominators(nominations: [StorageKey, Option<Nominations>][]): Record<string, [string, number][]> {
  return nominations.reduce((mapped: Record<string, [string, number][]>, [key, optNoms]) => {
    if (optNoms.isSome) {
      const nominatorId = key.args[0].toString();

      optNoms.unwrap().targets.forEach((_validatorId, index): void => {
        const validatorId = _validatorId.toString();
        const info: [string, number] = [nominatorId, index + 1];

        if (!mapped[validatorId]) {
          mapped[validatorId] = [info];
        } else {
          mapped[validatorId].push(info);
        }
      });
    }

    return mapped;
  }, {});
}

function useNominators<T extends IDeriveStakingElected | DeriveStakingWaiting>(method: 'electedInfo' | 'waitingInfo') {
  const { api } = useApi();
  const { accounts } = useWallet();
  const [nominators, setNominators] = useState<[string, Power][] | null>(null);
  const [total, setTotal] = useState<BN>(BN_ZERO);
  const [sourceData, setSourceData] = useState<T | null>(null);
  const { takeWhileIsMounted } = useIsMountedOperator();

  useEffect(() => {
    const elected$$ = from(
      api.derive.staking[method]({ withController: true, withExposure: true, withPrefs: true, withLedger: true })
    )
      .pipe(takeWhileIsMounted())
      .subscribe((derive) => {
        const { info } = derive;
        const all = accounts.map((item) => item.displayAddress);
        const data = info
          .map(({ exposure, accountId }) => {
            const result: Record<string, BN> = {};

            exposure?.others.reduce((isNominating, cur) => {
              const nominator = cur.who.toString();

              result[nominator] = (result[nominator] || BN_ZERO).add(cur.value?.toBn() || BN_ZERO);

              return isNominating || all.includes(nominator);
            }, all.includes(accountId.toString()));

            return result;
          })
          .reduce((acc, cur) => ({ ...acc, ...cur }), {});

        const num = info.reduce((acc, { exposure }) => acc.add((exposure as unknown as ExposureT).totalPower), BN_ZERO);

        setNominators(Object.entries(data) as [string, Power][]);
        setTotal(num);
        setSourceData(derive as T);
      });

    return () => {
      elected$$.unsubscribe();
    };
  }, [accounts, api.derive.staking, method, takeWhileIsMounted]);

  return { nominators, total, sourceData };
}

export function useElectedNominators() {
  const { nominators, total, sourceData } = useNominators<IDeriveStakingElected>('electedInfo');

  return { nominators, totalStaked: total, sourceData };
}

export function useWaitingNominators() {
  const { nominators, total, sourceData } = useNominators<DeriveStakingWaiting>('waitingInfo');

  return { nominators, totalWaiting: total, sourceData };
}

export function useNominatorEntries() {
  const { api } = useApi();
  const [entries, setEntries] = useState<Record<string, [string, number][]> | null>(null);
  const isMounted = useIsMounted();

  useEffect(() => {
    const sub$$ = from(api.query.staking.nominators.entries())
      .pipe(takeWhile(() => isMounted))
      .subscribe((res) => {
        setEntries(extractNominators(res as [StorageKey, Option<Nominations>][]));
      });

    return () => sub$$.unsubscribe();
  }, [api, isMounted]);

  return { nominatedBy: entries };
}
