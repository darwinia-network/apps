import { PropsWithChildren, useState, createContext, useCallback, useEffect } from 'react';
import type { Signer as InjectedSigner } from '@polkadot/api/types';
import { accounts as accountsObs } from '@polkadot/ui-keyring/observable/accounts';
import type { SubjectInfo } from '@polkadot/ui-keyring/observable/types';
import type { Injected } from '@polkadot/extension-inject/types';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import { from, switchMap, tap } from 'rxjs';
import isMobile from 'is-mobile';
import type { Wallet, Account, WalletSource } from '../model';
import { DAPP_NAME, LOCAL_SOURCE, SEARCH_PARAMS_SOURCE, supportedWallets } from '../config';
import { convertToSS58, isValidAddress, updateStorage, readStorage } from '../utils';
import { useApi } from '../hooks';

export interface WalletCtx {
  error: Error | null | undefined;
  signer: InjectedSigner | null | undefined;

  accounts: Account[];

  walletToUse: Wallet | null | undefined;
  supportedWallets: Omit<Wallet, keyof Injected>[];

  connectWallet: (source: WalletSource) => Promise<boolean>;
  disConnectWallet: () => void;
}

export const WalletContext = createContext<WalletCtx>({} as WalletCtx);

export const WalletProvider = ({ children }: PropsWithChildren<unknown>) => {
  const { api, network } = useApi();

  const [accountsObsData, setAccountsObsData] = useState<SubjectInfo>({});

  const [error, setError] = useState<Error | null>();
  const [signer, setSigner] = useState<InjectedSigner | null>();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [walletToUse, setWalletToUse] = useState<Wallet | null>();

  const getWalletBySource = useCallback(
    (source: WalletSource) => supportedWallets.find((item) => item.extensionName === source),
    []
  );

  const connectWallet = useCallback(
    async (source: WalletSource) => {
      try {
        const wallet = getWalletBySource(source);
        const provider = await wallet?.getProvider()?.enable(DAPP_NAME);

        if (wallet && provider) {
          setWalletToUse({ ...wallet, ...provider });
          return true;
        }
      } catch (err) {
        console.error(err);
        setError(err as Error);
      }

      return false;
    },
    [getWalletBySource]
  );

  const disConnectWallet = useCallback(() => {
    setSigner(null);
    setAccounts([]);
    setWalletToUse(null);
  }, []);

  useEffect(() => {
    const sub$$ = from(accountsObs.subject.asObservable()).subscribe(setAccountsObsData);

    return () => sub$$.unsubscribe();
  }, []);

  useEffect(() => {
    const readOnlyAddress =
      new URL(window.location.href).searchParams.get('address') || '5DXNxrbYboFHxX7CZdqgqfWfCBdSn2MKBRjCNLpahV2Pff6C';
    const readOnly =
      readOnlyAddress && isValidAddress(readOnlyAddress)
        ? [
            {
              address: readOnlyAddress,
              displayAddress: convertToSS58(readOnlyAddress, network.ss58Prefix),
              meta: { name: 'Read-Only', source: SEARCH_PARAMS_SOURCE },
            },
          ]
        : [];

    setAccounts((prev) => {
      const exist = prev.find(({ meta }) => meta.source === SEARCH_PARAMS_SOURCE);

      return exist ? prev : [...prev, ...readOnly];
    });
  }, [network.ss58Prefix]);

  useEffect(() => {
    if (!walletToUse) {
      return;
    }

    setSigner(walletToUse.signer);

    const apiGenesisHash = api.genesisHash.toHex();

    const sub$$ = walletToUse.accounts.subscribe((accs) => {
      const extension = accs
        .filter((acc) => !acc.genesisHash || acc.genesisHash === apiGenesisHash)
        .map((acc) => {
          const { address, genesisHash, name, type } = acc;

          return {
            address,
            displayAddress: convertToSS58(address, network.ss58Prefix),
            type,
            meta: {
              genesisHash,
              name,
              source: walletToUse.extensionName,
            },
          };
        });

      const keys = Object.keys(accountsObsData);
      const extensionAddresses = accs.map((item) => item.address);
      const sources = keys.filter((key) => !extensionAddresses.includes(key));

      const locals: Account[] = sources.map((address) => {
        const found = accs.find((item) => item.address === address);

        return {
          address,
          displayAddress: convertToSS58(address, network.ss58Prefix),
          type: found?.type,
          json: accountsObsData[address].json,
          meta: {
            genesisHash: found?.genesisHash,
            name: found?.name,
            source: LOCAL_SOURCE,
          },
        };
      });

      setAccounts((prev) => {
        const readOnly = prev.find(({ meta }) => meta.source === SEARCH_PARAMS_SOURCE);

        return readOnly ? [...extension, ...locals, readOnly] : [...extension, ...locals];
      });
    });

    return () => sub$$();
  }, [walletToUse, network.ss58Prefix, api, accountsObsData]);

  useEffect(() => {
    connectWallet(readStorage().activeWallet);
  }, [connectWallet]);

  useEffect(() => {
    if (walletToUse) {
      updateStorage({ activeWallet: walletToUse?.extensionName });
    }
  }, [walletToUse]);

  useEffect(() => {
    if (!isMobile()) {
      return;
    }

    const sub$$ = from(web3Enable(DAPP_NAME))
      .pipe(
        tap((extensions) => {
          if (extensions.length) {
            setSigner(extensions[0].signer);
          }
        }),
        switchMap(() => {
          return from(web3Accounts());
        })
      )
      .subscribe((accs) => {
        setAccounts(
          accs.map((acc) => ({
            address: acc.address,
            meta: acc.meta,
            type: acc.type,
            displayAddress: convertToSS58(acc.address, network.ss58Prefix),
          }))
        );
      });

    return () => sub$$.unsubscribe();
  }, [network.ss58Prefix]);

  return (
    <WalletContext.Provider
      value={{
        error,
        signer,
        accounts,
        walletToUse,
        supportedWallets,
        connectWallet,
        disConnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
