import { ValidatorPrefs } from '@darwinia/types';
import { DeriveAccountInfo } from '@polkadot/api-derive/types';
import { Option } from '@polkadot/types';
import { EraIndex } from '@polkadot/types/interfaces';
import { Skeleton } from 'antd';
import { createContext, useContext, useEffect, useState } from 'react';
import { from, switchMap } from 'rxjs';
import { DeriveStakingQuery } from '../../../api-derive/types';
import { useApi } from '../../../hooks';

interface Overview {
  accountInfo: DeriveAccountInfo;
  stakingInfo: DeriveStakingQuery;
  validatorPrefs: ValidatorPrefs;
}

export const OverviewContext = createContext<Overview | null>(null);

export const useOverview = () => useContext(OverviewContext) as Exclude<Overview, null>;

export const OverviewProvider = ({ children, account }: React.PropsWithChildren<{ account: string }>) => {
  const { api } = useApi();
  const [accountInfo, setAccountInfo] = useState<DeriveAccountInfo | null>(null);
  const [stakingInfo, setStakingInfo] = useState<DeriveStakingQuery | null>(null);
  const [validatorPrefs, setValidatorPrefs] = useState<ValidatorPrefs | null>(null);

  useEffect(() => {
    const account$$ = from(api.derive.accounts.info(account)).subscribe((res) => {
      setAccountInfo(res);
    });

    const staking$$ = from(api.derive.staking.query(account, { withLedger: true })).subscribe((res) =>
      setStakingInfo(res as unknown as DeriveStakingQuery)
    );

    const eraIndex$$ = from(api.query.staking.currentEra())
      .pipe(
        switchMap((res) => {
          const index = (res as Option<EraIndex>).unwrap();

          return from(api.query.staking.erasValidatorPrefs(index, account));
        })
      )
      .subscribe((res) => {
        setValidatorPrefs(res as ValidatorPrefs);
      });

    return () => {
      account$$.unsubscribe();
      staking$$.unsubscribe();
      eraIndex$$.unsubscribe();
    };
  }, [account, api]);

  if (!accountInfo || !stakingInfo || !validatorPrefs) {
    return <Skeleton active />;
  }

  return (
    <OverviewContext.Provider value={{ accountInfo, stakingInfo, validatorPrefs }}>{children}</OverviewContext.Provider>
  );
};
