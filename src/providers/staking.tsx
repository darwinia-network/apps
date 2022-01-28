import { DeriveStakingAccount, DeriveStakingOverview } from '@polkadot/api-derive/staking/types';
import { GenericAccountId, Option } from '@polkadot/types';
import { StakingLedger } from '@polkadot/types/interfaces/staking';
import { PalletStakingValidatorPrefs } from '@polkadot/types/lookup';
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { combineLatest, from, map, switchMap, takeWhile, zip } from 'rxjs';
import { useAccount, useApi, useIsMounted } from '../hooks';
import { isSameAddress } from '../utils';

export interface StakingCtx {
  availableValidators: string[];
  controllerAccount: string;
  isControllerAccountOwner: boolean;
  isNominating: boolean;
  isStashAccountOwner: boolean;
  isValidating: boolean;
  stakingDerive: DeriveStakingAccount | null;
  stakingOverview: DeriveStakingOverview | null;
  stashAccount: string;
  stashAccounts: string[];
  updateStakingDerive: () => void;
  updateValidators: () => void;
  validators: PalletStakingValidatorPrefs | null;
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

export const StakingContext = createContext<StakingCtx | null>(null);

export const StakingProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const {
    api,
    connection: { accounts },
  } = useApi();
  const { account } = useAccount();
  const [controllerAccount, setControllerAccount] = useState<string>(account);
  const [stashAccount, setStashAccount] = useState<string>(account);
  const [stashAccounts, setStashAccounts] = useState<string[]>([]);
  const [isStashAccountOwner, setIsStashAccountOwner] = useState<boolean>(true);
  const [stakingDerive, setStakingDerive] = useState<DeriveStakingAccount | null>(null);
  const [validators, setValidators] = useState<PalletStakingValidatorPrefs | null>(null);
  const [stakingOverview, setStakingOverview] = useState<DeriveStakingOverview | null>(null);

  const availableValidators = useMemo(() => {
    if (stakingOverview && stashAccounts) {
      const data = stakingOverview.validators.map((item) => item.toString());

      return stashAccounts.filter((item) => !data.includes(item));
    }

    return [];
  }, [stakingOverview, stashAccounts]);

  const isControllerAccountOwner = useMemo(
    () =>
      !!controllerAccount &&
      accounts.map((item) => item.address).some((address) => isSameAddress(address, controllerAccount)),
    [accounts, controllerAccount]
  );

  const isValidating = useMemo(() => {
    return (
      !!validators &&
      (!(Array.isArray(validators) ? validators[1].isEmpty : validators.isEmpty) ||
        stashAccounts.includes(stashAccount))
    );
  }, [stashAccount, stashAccounts, validators]);

  const isNominating = useMemo(() => !!stakingDerive?.nominators.length, [stakingDerive]);
  const isMounted = useIsMounted();

  const updateStakingDerive = useCallback(() => {
    from(api.derive.staking.account(stashAccount))
      .pipe(takeWhile(() => isMounted))
      .subscribe((res) => setStakingDerive(res));
  }, [api, isMounted, stashAccount]);

  const updateValidators = useCallback(() => {
    from(api.query.staking.validators(stashAccount))
      .pipe(takeWhile(() => isMounted))
      .subscribe((res) => setValidators(res));
  }, [api, isMounted, stashAccount]);

  const updateStakingOverview = useCallback(() => {
    combineLatest([api.derive.session.indexes(), api.derive.staking.validators()])
      .pipe(takeWhile(() => isMounted))
      .subscribe(([idx, val]) => setStakingOverview({ ...idx, ...val }));
  }, [api, isMounted]);

  useEffect(() => {
    const sub$$ = from(api.derive.staking.stashes()).subscribe((res) => {
      setStashAccounts(res.map((item) => item.toString()));
    });

    return () => {
      sub$$.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  }, [account, accounts, api]);

  useEffect(() => {
    updateStakingDerive();
    updateValidators();
    updateStakingOverview();
  }, [updateStakingDerive, updateStakingOverview, updateValidators]);

  return (
    <StakingContext.Provider
      value={{
        availableValidators,
        controllerAccount,
        isControllerAccountOwner,
        isNominating,
        isStashAccountOwner,
        isValidating,
        stakingDerive,
        stakingOverview,
        stashAccount,
        stashAccounts,
        updateStakingDerive,
        updateValidators,
        validators,
      }}
    >
      {children}
    </StakingContext.Provider>
  );
};
