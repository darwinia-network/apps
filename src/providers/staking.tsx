import { DeriveStakingOverview } from '@polkadot/api-derive/staking/types';
import { ElectionStatus } from '@polkadot/types/interfaces';
import { PalletStakingValidatorPrefs } from '@polkadot/types/lookup';
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { combineLatest, from, tap } from 'rxjs';
import { DeriveStakingAccount } from '../api-derive/types';
import { useWallet, useApi, useIsMountedOperator, useAccount, useControllerAndStashAccount } from '../hooks';
import { isSameAddress } from '../utils';

export interface StakingCtx {
  availableValidators: string[];
  controllerAccount: string | null;
  isControllerAccountOwner: boolean;
  isNominating: boolean;
  isStakingDeriveLoading: boolean;
  isStakingLedgerEmpty: boolean;
  isValidating: boolean;
  isInElection: boolean;
  stakingDerive: DeriveStakingAccount | null;
  stakingOverview: DeriveStakingOverview | null;
  stashAccount: string | null;
  stashAccounts: string[];
  updateStakingDerive: () => void;
  updateValidators: () => void;
  refreshControllerAndStashAccount: () => void;
  validators: PalletStakingValidatorPrefs | null;
}

export const StakingContext = createContext<StakingCtx | null>(null);

export const StakingProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const { api } = useApi();
  const { accounts } = useWallet();
  const { account } = useAccount();
  const { controllerAccount, stashAccount, refreshControllerAndStashAccount } = useControllerAndStashAccount(
    account?.displayAddress
  );
  const [stashAccounts, setStashAccounts] = useState<string[]>([]);
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
      !!stashAccount &&
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

  useEffect(() => {
    refreshControllerAndStashAccount();
  }, [refreshControllerAndStashAccount]);

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
        isValidating,
        isInElection,
        stakingDerive,
        stakingOverview,
        stashAccount,
        stashAccounts,
        updateStakingDerive,
        updateValidators,
        refreshControllerAndStashAccount,
        validators,
      }}
    >
      {children}
    </StakingContext.Provider>
  );
};
