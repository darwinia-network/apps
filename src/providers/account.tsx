import { createContext, useEffect, useState, useCallback } from 'react';
import keyring from '@polkadot/ui-keyring';
import { useAssets, useWallet } from '../hooks';
import { Asset, Account } from '../model';
import { readStorage, updateStorage } from '../utils';
import { SEARCH_PARAMS_SOURCE } from '../config';
import { SelectAccountModal } from '../components/widget/account/SelectAccountModal';

export interface AccountCtx {
  assets: Asset[];
  assetsLoading: boolean | undefined;
  account: Account | null | undefined;

  refreshAssets: () => void;
  selectAccount: (address: string) => void;
}

export const AccountContext = createContext<AccountCtx>({} as AccountCtx);

export const AccountProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const { accounts } = useWallet();
  const [account, setAccount] = useState<Account | null>();
  const { assets, loading: assetsLoading, getAssets: refreshAssets } = useAssets(account?.displayAddress || '');
  const [visible, setVisible] = useState(false);

  const selectAccount = useCallback(
    (address: string) => {
      setAccount(accounts.find((acc) => acc.address === address));
    },
    [accounts]
  );

  useEffect(() => {
    if (!accounts.length) {
      setAccount(null);
      return;
    }

    accounts.forEach(({ displayAddress, meta }) => {
      keyring.saveAddress(displayAddress, meta);
    });

    const storageAddress = readStorage().activeAccount;
    const storageAccount = accounts.find(({ address }) => address === storageAddress);
    const readOnlyAccount = accounts.find(({ meta }) => meta.source === SEARCH_PARAMS_SOURCE);

    const acc = readOnlyAccount ?? storageAccount;
    if (acc) {
      setAccount(acc);
    } else {
      setVisible(true);
    }
  }, [accounts]);

  useEffect(() => {
    if (account) {
      updateStorage({ activeAccount: account?.address });
    }
  }, [account]);

  return (
    <>
      <AccountContext.Provider
        value={{
          assets,
          account,
          assetsLoading,
          selectAccount,
          refreshAssets,
        }}
      >
        {children}
      </AccountContext.Provider>

      <SelectAccountModal
        visible={visible}
        defaultValue=""
        onCancel={() => setVisible(false)}
        onSelect={(acc) => {
          selectAccount(acc);
          setVisible(false);
        }}
        footer={null}
      />
    </>
  );
};
