import { createContext, useContext, useEffect, useState } from 'react';
import { DeriveAccountInfo } from '@polkadot/api-derive/types';
import { from } from 'rxjs';
import { useApi } from '../../../hooks';
import { DeriveStakingQuery } from '../../../api-derive/types';

interface Overview {
  accountInfo: DeriveAccountInfo;
  stakingInfo: DeriveStakingQuery;
}

export const OverviewContext = createContext<Overview | null>(null);

export const useOverview = () => useContext(OverviewContext) as Exclude<Overview, null>;

export const OverviewProvider = ({ children, account }: React.PropsWithChildren<{ account: string }>) => {
  const { api } = useApi();
  const [accountInfo, setAccountInfo] = useState<DeriveAccountInfo | null>(null);
  const [stakingInfo, setStakingInfo] = useState<DeriveStakingQuery | null>(null);

  useEffect(() => {
    const account$$ = from(api.derive.accounts.info(account)).subscribe((res) => {
      setAccountInfo(res);
    });

    const staking$$ = from(api.derive.staking.query(account, { withLedger: true })).subscribe((res) =>
      setStakingInfo(res as unknown as DeriveStakingQuery)
    );

    return () => {
      account$$.unsubscribe();
      staking$$.unsubscribe();
    };
  }, [account, api]);

  if (!accountInfo || !stakingInfo) {
    return <></>;
  }

  return <OverviewContext.Provider value={{ accountInfo, stakingInfo }}>{children}</OverviewContext.Provider>;
};
