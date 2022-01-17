/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useEffect, useState } from 'react';
import { useApi } from '../hooks';
import { convertToSS58 } from '../utils';

export interface AccountCtx {
  account: string;
  setAccount: (account: string) => void;
}

export const AccountContext = createContext<AccountCtx | null>(null);

export const AccountProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const [account, setAccount] = useState<string>('');
  const { network, connection } = useApi();

  useEffect(() => {
    const acc = account || connection?.accounts[0]?.address;

    if (!acc) {
      return;
    }

    const ss58Account = convertToSS58(acc, network.ss58Prefix);

    setAccount(ss58Account);
  }, [network.ss58Prefix, connection]);

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
