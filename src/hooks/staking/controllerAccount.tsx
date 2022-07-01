import { useState, useEffect, useCallback } from 'react';
import { from, EMPTY } from 'rxjs';
import type { Option } from '@polkadot/types';
import type { AccountId32 } from '@polkadot/types/interfaces';

import { useApi } from '../api';

export const useControllerAccount = (account?: string | null) => {
  const { api } = useApi();
  const [controllerAccount, setControllerAccount] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (account) {
      return from<Promise<Option<AccountId32>>>(api.query.staking.bonded(account)).subscribe((bonded) => {
        setControllerAccount(bonded.isSome ? bonded.unwrap().toString() : account);
      });
    } else {
      setControllerAccount(null);
      return EMPTY.subscribe();
    }
  }, [api, account]);

  useEffect(() => {
    const sub$$ = refresh();

    return () => sub$$.unsubscribe();
  }, [refresh]);

  return { controllerAccount, refreshControllerAccount: refresh };
};
