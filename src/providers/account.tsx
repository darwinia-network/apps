/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useEffect, useState } from 'react';
import { useApi } from '../hooks';
import { convertToSS58 } from '../utils';

export interface AccountCtx {
  account: string | null;
  setAccount: (account: string) => void;
}

export const AccountContext = createContext<AccountCtx | null>(null);

export const AccountProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const [account, setAccount] = useState<string | null>(null);
  const { network } = useApi();

  useEffect(() => {
    if (!account) {
      return;
    }

    const ss58Account = convertToSS58(account, network.ss58Prefix);

    setAccount(ss58Account);
  }, [network]);

  return (
    <AccountContext.Provider
      value={{
        setAccount,
        account,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};
