import { useState, useEffect } from 'react';
import { from } from 'rxjs';
import type { Option } from '@polkadot/types';
import type { AccountId32 } from '@polkadot/types/interfaces';
import { useApi } from '..';

export const useControllerAccount = (account?: string | null) => {
  const { api } = useApi();
  const [controllerAccount, setControllerAccount] = useState<string | null>();

  useEffect(() => {
    if (!account) {
      setControllerAccount(null);
      return;
    }

    const sub$$ = from<Promise<Option<AccountId32>>>(api.query.staking.bonded(account)).subscribe((bonded) => {
      setControllerAccount(bonded.isSome ? bonded.unwrap().toString() : account);
    });

    return () => sub$$.unsubscribe();
  }, [api, account]);

  return { controllerAccount };
};
