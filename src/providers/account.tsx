import React, { createContext, useEffect, useMemo, useState } from 'react';
import { useApi } from '../hooks';
import { IAccountMeta } from '../model';
import { convertToSS58, isSameAddress } from '../utils';

export interface AccountCtx {
  account: string;
  setAccount: (account: string) => void;
  accountWithMeta: IAccountMeta;
}

export const AccountContext = createContext<AccountCtx | null>(null);

export const AccountProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const [account, setAccount] = useState<string>('');
  const { network, connection } = useApi();
  const accountWithMeta = useMemo(
    () => connection.accounts.find((item) => isSameAddress(item.address, account)) ?? connection.accounts[0],
    [account, connection]
  );

  useEffect(() => {
    const acc = account || connection?.accounts[0]?.address;

    if (!acc) {
      return;
    }

    const ss58Account = convertToSS58(acc, network.ss58Prefix);

    setAccount(ss58Account);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network.ss58Prefix, connection]);

  return (
    <AccountContext.Provider
      value={{
        setAccount,
        account,
        accountWithMeta,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};
