import { useState, useEffect } from 'react';
import { from } from 'rxjs';
import type { Option } from '@polkadot/types';

import { useApi } from '../../hooks';
import type { DarwiniaStakingStructsStakingLedger } from '../../api-derive/types';

export const useStashAccount = (controllerAccount?: string | null) => {
  const { api } = useApi();
  const [stashAccount, setStashAccount] = useState<string | null>();

  useEffect(() => {
    if (!controllerAccount) {
      setStashAccount(null);
      return;
    }

    const sub$$ = from<Promise<Option<DarwiniaStakingStructsStakingLedger>>>(
      api.query.staking.ledger(controllerAccount)
    ).subscribe((ledger) => {
      setStashAccount(ledger.isSome ? ledger.unwrap().stash.toString() : controllerAccount);
    });

    return () => sub$$.unsubscribe();
  }, [api, controllerAccount]);

  return { stashAccount };
};
