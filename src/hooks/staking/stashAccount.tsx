import { useState, useEffect, useCallback } from 'react';
import { from, EMPTY } from 'rxjs';
import { useApi } from '../../hooks';

export const useStashAccount = (controllerAccount?: string | null) => {
  const { api } = useApi();
  const [stashAccount, setStashAccount] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (controllerAccount && api.query.staking) {
      return from(api.query.staking.ledger(controllerAccount)).subscribe((ledger) => {
        setStashAccount(ledger.isSome ? ledger.unwrap().stash.toString() : null);
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
