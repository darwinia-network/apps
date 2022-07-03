import { useState, useEffect, useCallback } from 'react';
import { from, EMPTY } from 'rxjs';
import type { Option } from '@polkadot/types';

import { useApi } from '../../hooks';
import type { DarwiniaStakingStructsStakingLedger } from '../../api-derive/types';

export const useStashAccount = (controllerAccount?: string | null) => {
  const { api } = useApi();
  const [stashAccount, setStashAccount] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (controllerAccount && api.query.staking) {
      return from<Promise<Option<DarwiniaStakingStructsStakingLedger>>>(
        api.query.staking.ledger(controllerAccount)
      ).subscribe((ledger) => {
        setStashAccount(ledger.isSome ? ledger.unwrap().stash.toString() : controllerAccount);
      });
    } else {
      setStashAccount(null);
      return EMPTY.subscribe();
    }
  }, [api, controllerAccount]);

  useEffect(() => {
    const sub$$ = refresh();

    return () => sub$$.unsubscribe();
  }, [refresh]);

  return { stashAccount, refreshStashAccount: refresh };
};
