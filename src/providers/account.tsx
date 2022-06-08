import { createContext, useEffect, useState, useCallback } from 'react';
import keyring from '@polkadot/ui-keyring';
import { useAssets, useWallet } from '../hooks';
import { Asset, Account } from '../model';
import { readStorage, updateStorage } from '../utils';
import { SEARCH_PARAMS_SOURCE } from '../config';

export interface AccountCtx {
  assets: Asset[];
  account: Account | null | undefined;

  refreshAssets: () => void;
  selectAccount: (address: string) => void;
}

export const AccountContext = createContext<AccountCtx>({} as AccountCtx);

export const AccountProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const { accounts } = useWallet();
  const [account, setAccount] = useState<Account | null>();
  const { assets, getAssets: refreshAssets } = useAssets(account?.displayAddress || '');

  const selectAccount = useCallback(
    (address: string) => {
      setAccount(accounts.find((acc) => acc.address === address));
    },
    [accounts]
  );

  useEffect(() => {
    accounts.forEach(({ address, meta }) => {
      keyring.saveAddress(address, meta);
    });

    const storageAddress = readStorage().activeAccount;
    const storageAccount = accounts.find(({ address }) => address === storageAddress);
    const readOnlyAccount = accounts.find(({ meta }) => meta.source === SEARCH_PARAMS_SOURCE);

    setAccount(account ?? readOnlyAccount ?? storageAccount ?? accounts[0]);
  }, [accounts, account]);

  useEffect(() => {
    updateStorage({ activeAccount: account?.address });
  }, [account]);

  return (
    <AccountContext.Provider
      value={{
        assets,
        account,
        selectAccount,
        refreshAssets,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};
