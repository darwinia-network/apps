import React, { createContext, useEffect, useMemo, useState } from 'react';
import { useApi, useAssets } from '../hooks';
import { Asset, IAccountMeta } from '../model';
import { convertToSS58, isSameAddress, readStorage, updateStorage } from '../utils';

export interface AccountCtx {
  account: string;
  setAccount: (account: string) => void;
  accountWithMeta: IAccountMeta;
  assets: Asset[];
  getBalances: (acc?: string) => void;
}

const DEFAULT_ADDRESS_PREFIX = 42; // Substrate, 42

export const AccountContext = createContext<AccountCtx | null>(null);

export const AccountProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const [account, setAccount] = useState<string>('');
  const { network, connection } = useApi();
  const accountWithMeta = useMemo(
    () => connection.accounts.find((item) => isSameAddress(item.address, account)) ?? connection.accounts[0],
    [account, connection]
  );
  const { assets, getBalances } = useAssets(account);

  useEffect(() => {
    const accStorage = convertToSS58(readStorage().activeAccount || '', network.ss58Prefix);
    const acc =
      account ||
      connection?.accounts.find((value) => value.address === accStorage)?.address ||
      connection?.accounts[0]?.address;

    if (!acc) {
      return;
    }

    setAccount(acc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network.ss58Prefix, connection]);

  useEffect(() => {
    updateStorage({ activeAccount: convertToSS58(account, DEFAULT_ADDRESS_PREFIX) });
  }, [account]);

  return (
    <AccountContext.Provider
      value={{
        account,
        accountWithMeta,
        assets,
        setAccount,
        getBalances,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};
