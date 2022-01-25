import { GenericAccountId, Option } from '@polkadot/types';
import { StakingLedger } from '@polkadot/types/interfaces/staking';
import React, { createContext, useEffect, useState } from 'react';
import { from, map, switchMap, zip } from 'rxjs';
import { useAccount, useApi } from '../hooks';

export interface StakingAccountCtx {
  controllerAccount: string;
  stashAccount: string;
  isStashAccountOwner: boolean;
}

function getControllerAccount(
  assumedControllerAccount: string,
  bonded?: Option<GenericAccountId>[],
  ledger?: Option<StakingLedger>
): string {
  if (bonded && ledger) {
    bonded.forEach((value): void => {
      if (value.isSome) {
        assumedControllerAccount = value.unwrap().toString();
      }
    });
  }

  return assumedControllerAccount;
}

function getStashAccount(bonded: Option<GenericAccountId>[], ledger: Option<StakingLedger>): string {
  let result = '';

  bonded.forEach((value): void => {
    if (value.isSome) {
      // !FIXME: max result.length: 1 ? bug?
      result = value.unwrap().toString();
    }
  });

  if (ledger.isSome) {
    const stashAccount = ledger.unwrap().stash.toString();

    if (result !== stashAccount) {
      result = stashAccount;
    }
  }

  return result;
}

function isOwner(bonded: Option<GenericAccountId>[], ledger: Option<StakingLedger>): boolean {
  return ledger.isSome || bonded.some((value) => value.isSome);
}

export const StakingAccountContext = createContext<StakingAccountCtx | null>(null);

export const StakingAccountProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const { api } = useApi();
  const { account } = useAccount();
  const [controllerAccount, setControllerAccount] = useState<string>(account);
  const [stashAccount, setStashAccount] = useState<string>(account);
  const [isStashAccountOwner, setIsStashAccountOwner] = useState<boolean>(true);

  useEffect(() => {
    if (!account) {
      return;
    }

    const getSource = (address: string) =>
      zip([from(api.query.staking.bonded.multi([address])), from(api.query.staking.ledger(address))]);

    const sub$$ = getSource(account)
      .pipe(
        map(([bonded, ledger]) => getControllerAccount(account, bonded, ledger)),
        switchMap((controller) =>
          getSource(controller).pipe(
            map(([bonded, ledger]) => {
              const stash = getStashAccount(bonded, ledger);
              const is = isOwner(bonded, ledger);

              return { controller, stash, is };
            })
          )
        )
      )
      .subscribe(({ controller, stash, is }) => {
        setControllerAccount(controller);
        setStashAccount(stash);
        setIsStashAccountOwner(is);
      });

    return () => {
      sub$$.unsubscribe();
    };
  }, [account, api]);

  return (
    <StakingAccountContext.Provider
      value={{
        controllerAccount,
        stashAccount,
        isStashAccountOwner,
      }}
    >
      {children}
    </StakingAccountContext.Provider>
  );
};
