import { DeriveStakingOverview } from '@polkadot/api-derive/staking/types';
import { ElectionStatus } from '@polkadot/types/interfaces';
import type { u32 } from '@polkadot/types';
import { DarwiniaStakingStructsValidatorPrefs } from '@polkadot/types/lookup';
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { combineLatest, from, tap, EMPTY, Subscription } from 'rxjs';
import type { DeriveStakingAccount } from '@darwinia/api-derive/types';
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
  isSupportedStaking: boolean;
  stakingDerive: DeriveStakingAccount | null;
  stakingOverview: DeriveStakingOverview | null;
  stashAccount: string | null;
  stashAccounts: string[];
  maxNominations: number;
  updateStakingDerive: () => void;
  updateValidators: () => void;
  refreshControllerAccount: () => Subscription;
  refreshStashAccount: () => Subscription;
  validators: DarwiniaStakingStructsValidatorPrefs | null;
}

export const StakingContext = createContext<StakingCtx | null>(null);

export const StakingProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const { api } = useApi();
  const { accounts } = useWallet();
  const { account } = useAccount();
  const { controllerAccount, stashAccount, refreshControllerAccount, refreshStashAccount } =
    useControllerAndStashAccount(account?.displayAddress);
  const { takeWhileIsMounted } = useIsMountedOperator();
  const [stashAccounts, setStashAccounts] = useState<string[]>([]);
  const [stakingDerive, setStakingDerive] = useState<DeriveStakingAccount | null>(null);
  const [isStakingDeriveLoading, setIsStakingDeriveLoading] = useState<boolean>(false);
  const [validators, setValidators] = useState<DarwiniaStakingStructsValidatorPrefs | null>(null);
  const [stakingOverview, setStakingOverview] = useState<DeriveStakingOverview | null>(null);
  const [isInElection, setIsInElection] = useState<boolean>(false);

  const isSupportedStaking = useMemo(() => !!api.tx.staking, [api]);

  const maxNominations = useMemo(() => (api.consts.staking?.maxNominations as u32)?.toNumber() || 0, [api]);

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

  const updateStakingDerive = useCallback(() => {
    if (account && isSupportedStaking) {
      return from(api.derive.staking.account(account.displayAddress))
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
    } else {
      setStakingDerive(null);
      return EMPTY.subscribe();
    }
  }, [api, account, isSupportedStaking, takeWhileIsMounted]);

  const updateValidators = useCallback(() => {
    if (isSupportedStaking && stashAccount) {
      return from<Promise<DarwiniaStakingStructsValidatorPrefs>>(api.query.staking.validators(stashAccount))
        .pipe(takeWhileIsMounted())
        .subscribe((res) => setValidators(res));
    } else {
      setValidators(null);
      return EMPTY.subscribe();
    }
  }, [api, stashAccount, isSupportedStaking, takeWhileIsMounted]);

  const updateStakingOverview = useCallback(() => {
    if (isSupportedStaking) {
      return combineLatest([api.derive.session.indexes(), api.derive.staking.validators()])
        .pipe(takeWhileIsMounted())
        .subscribe(([idx, val]) => setStakingOverview({ ...idx, ...val }));
    } else {
      setStakingOverview(null);
      return EMPTY.subscribe();
    }
  }, [api, isSupportedStaking, takeWhileIsMounted]);

  useEffect(() => {
    if (!isSupportedStaking) {
      setStashAccounts([]);
      return;
    }

    const sub$$ = from(api.derive.staking.stashes()).subscribe((res) => {
      setStashAccounts(res.map((item) => item.toString()));
    });

    return () => sub$$.unsubscribe();
  }, [api, isSupportedStaking]);

  useEffect(() => {
    if (!isSupportedStaking || !api.query.staking?.eraElectionStatus) {
      setIsInElection(false);
      return;
    }

    const sub$$ = from(api.query.staking.eraElectionStatus() as Promise<ElectionStatus>).subscribe((status) =>
      setIsInElection(status.isOpen)
    );

    return () => sub$$.unsubscribe();
  }, [api, isSupportedStaking]);

  useEffect(() => {
    const subCrl$$ = refreshControllerAccount();
    const subSts$$ = refreshStashAccount();

    return () => {
      subCrl$$.unsubscribe();
      subSts$$.unsubscribe();
    };
  }, [refreshControllerAccount, refreshStashAccount]);

  useEffect(() => {
    const sub$$ = updateStakingDerive();
    return () => sub$$.unsubscribe();
  }, [updateStakingDerive]);

  useEffect(() => {
    const sub$$ = updateStakingOverview();
    return () => sub$$.unsubscribe();
  }, [updateStakingOverview]);

  useEffect(() => {
    const sub$$ = updateValidators();
    return () => sub$$.unsubscribe();
  }, [updateValidators]);

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
        isSupportedStaking,
        stakingDerive,
        stakingOverview,
        stashAccount,
        stashAccounts,
        maxNominations,
        updateStakingDerive,
        updateValidators,
        refreshControllerAccount,
        refreshStashAccount,
        validators,
      }}
    >
      {children}
    </StakingContext.Provider>
  );
};
