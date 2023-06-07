import { PropsWithChildren, createContext, useCallback, useEffect, useState } from "react";
import type { Account } from "../types";
import type { Injected } from "@polkadot/extension-inject/types";
import { accounts as accountsObs } from "@polkadot/ui-keyring/observable/accounts";
import { from } from "rxjs";
import type { SubjectInfo } from "@polkadot/ui-keyring/observable/types";

const DAPP_NAME = "darwinia/apps";

interface WalletCtx {
  isConnected: boolean;
  accounts: Account[];
  connect: () => Promise<void>;
}

export const WalletContext = createContext<WalletCtx>({
  isConnected: false,
  accounts: [],
  connect: async () => undefined,
});

export const WalletProvider = ({ children }: PropsWithChildren<unknown>) => {
  const [isConnected, setIsConnected] = useState<WalletCtx["isConnected"]>(false);
  const [accounts, setAccounts] = useState<WalletCtx["accounts"]>([]);

  const [accountsObsData, setAccountsObsData] = useState<SubjectInfo>({});

  const connect = useCallback(async () => {
    const injecteds = window.injectedWeb3;
    const wallet = injecteds && (injecteds["polkadot-js"] || injecteds['"polkadot-js"']);

    try {
      const provider: Injected | undefined = await wallet?.enable(DAPP_NAME);
      setIsConnected(true);

      if (provider) {
        const accs = await provider.accounts.get();

        const addresses = Object.keys(accountsObsData);
        const extensionAddresses = accs.map((item) => item.address);
        const localAddresses = addresses.filter((address) => !extensionAddresses.includes(address));

        setAccounts(localAddresses.map((address) => ({ address, json: accountsObsData[address].json })));
      }
    } catch (err) {
      console.error(err);
      setIsConnected(false);
      setAccounts([]);
    }
  }, [accountsObsData]);

  useEffect(() => {
    const sub$$ = from(accountsObs.subject.asObservable()).subscribe(setAccountsObsData);

    return () => sub$$.unsubscribe();
  }, []);

  return <WalletContext.Provider value={{ isConnected, accounts, connect }}>{children}</WalletContext.Provider>;
};
