import { DeriveStakingOverview } from '@polkadot/api-derive/staking/types';
import { GenericAccountId, Option } from '@polkadot/types';
import { ElectionStatus } from '@polkadot/types/interfaces';
import { StakingLedger } from '@polkadot/types/interfaces/staking';
import { PalletStakingValidatorPrefs } from '@polkadot/types/lookup';
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { combineLatest, from, map, switchMap, tap, zip } from 'rxjs';
import { DeriveStakingAccount } from '../api-derive/types';
import { useWallet, useApi, useIsMountedOperator, useAccount } from '../hooks';
import { isSameAddress } from '../utils';

export interface StakingCtx {
  availableValidators: string[];
  controllerAccount: string;
  isControllerAccountOwner: boolean;
  isNominating: boolean;
  isStakingDeriveLoading: boolean;
  isStakingLedgerEmpty: boolean;
  isStashAccountOwner: boolean;
  isValidating: boolean;
  isInElection: boolean;
  stakingDerive: DeriveStakingAccount | null;
  stakingOverview: DeriveStakingOverview | null;
  stashAccount: string;
  stashAccounts: string[];
  updateStakingDerive: () => void;
  updateValidators: () => void;
  updateControllerAndStash: () => void;
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
  const { api } = useApi();
  const { accounts } = useWallet();
  const { account } = useAccount();
  const [controllerAccount, setControllerAccount] = useState<string>(account?.displayAddress || '');
  const [stashAccount, setStashAccount] = useState<string>(account?.displayAddress || '');
  const [stashAccounts, setStashAccounts] = useState<string[]>([]);
  const [isStashAccountOwner, setIsStashAccountOwner] = useState<boolean>(true);
  const [stakingDerive, setStakingDerive] = useState<DeriveStakingAccount | null>(null);
  const [isStakingDeriveLoading, setIsStakingDeriveLoading] = useState<boolean>(false);
  const [validators, setValidators] = useState<PalletStakingValidatorPrefs | null>(null);
  const [stakingOverview, setStakingOverview] = useState<DeriveStakingOverview | null>(null);
  const [isInElection, setIsInElection] = useState<boolean>(false);

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
      accounts.map((item) => item.displayAddress).some((address) => isSameAddress(address, controllerAccount)),
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
  const isStakingLedgerEmpty = useMemo(
    () => !stakingDerive || !stakingDerive.stakingLedger || stakingDerive.stakingLedger.isEmpty,
    [stakingDerive]
  );
  const { takeWhileIsMounted } = useIsMountedOperator();

  const updateStakingDerive = useCallback(() => {
    if (account) {
      from(api.derive.staking.account(account.displayAddress))
        .pipe(
          tap(() => setIsStakingDeriveLoading(true)),
          takeWhileIsMounted()
        )
        .subscribe({
          next: (res) => {
            setStakingDerive(res as unknown as DeriveStakingAccount);
            setIsStakingDeriveLoading(false);
          },
          error: () => setIsStakingDeriveLoading(false),
        });
    }
  }, [api, account, takeWhileIsMounted]);

  const updateValidators = useCallback(() => {
    from<Promise<PalletStakingValidatorPrefs>>(api.query.staking.validators(stashAccount))
      .pipe(takeWhileIsMounted())
      .subscribe((res) => setValidators(res));
  }, [api, stashAccount, takeWhileIsMounted]);

  const updateStakingOverview = useCallback(() => {
    combineLatest([api.derive.session.indexes(), api.derive.staking.validators()])
      .pipe(takeWhileIsMounted())
      .subscribe(([idx, val]) => setStakingOverview({ ...idx, ...val }));
  }, [api, takeWhileIsMounted]);

  useEffect(() => {
    const sub$$ = from(api.derive.staking.stashes()).subscribe((res) => {
      setStashAccounts(res.map((item) => item.toString()));
    });

    return () => {
      sub$$.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateControllerAndStash = useCallback(() => {
    if (!account) {
      return;
    }

    const getSource = (address: string) =>
      zip([
        from<Promise<Option<GenericAccountId>[]>>(api.query.staking.bonded.multi([address])),
        from<Promise<Option<StakingLedger>>>(api.query.staking.ledger(address)),
      ]);

    getSource(account.displayAddress)
      .pipe(
        map(([bonded, ledger]) => getControllerAccount(account.displayAddress, bonded, ledger)),
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
  }, [account, api]);

  useEffect(() => {
    updateControllerAndStash();
  }, [updateControllerAndStash]);

  useEffect(() => {
    const sub$$ = from<Promise<ElectionStatus>>(
      api.query.staking?.eraElectionStatus ? api.query.staking.eraElectionStatus() : Promise.resolve({ isOpen: false })
    ).subscribe((status: ElectionStatus) => setIsInElection(status.isOpen));
    return () => {
      sub$$.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        isStakingDeriveLoading,
        isStakingLedgerEmpty,
        isStashAccountOwner,
        isValidating,
        isInElection,
        stakingDerive,
        stakingOverview,
        stashAccount,
        stashAccounts,
        updateStakingDerive,
        updateValidators,
        updateControllerAndStash,
        validators,
      }}
    >
      {children}
    </StakingContext.Provider>
  );
};
