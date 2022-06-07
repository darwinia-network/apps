import { PropsWithChildren, useState, createContext, useCallback, useEffect } from 'react';
import type { Signer as InjectedSigner } from '@polkadot/api/types';
import { accounts as accountsObs } from '@polkadot/ui-keyring/observable/accounts';
import type { SubjectInfo } from '@polkadot/ui-keyring/observable/types';
import { from } from 'rxjs';
import keyring from '@polkadot/ui-keyring';
import type { Wallet, Account, WalletSource } from '../model';
import { DAPP_NAME, LOCAL_SOURCE, SEARCH_PARAMS_SOURCE } from '../config';
import { convertToSS58, isValidAddress } from '../utils';
import { useApi } from '../hooks';

export interface WalletCtx {
  error: Error | null;
  signer: InjectedSigner | null;

  account: Account | null;
  accounts: Account[];

  walletToUse: Wallet | null;
  supportedWallets: Wallet[];

  selectAccount: (address: string) => void;

  connectWallet: (source: WalletSource) => Promise<boolean>;
  disConnectWallet: () => void;
}

const defaultState: Partial<WalletCtx> = {
  accounts: [],
  supportedWallets: [],
};

export const WalletContext = createContext<WalletCtx>(defaultState as WalletCtx);

export const WalletProvider = ({ children }: PropsWithChildren<unknown>) => {
  const { api, network } = useApi();

  const [accountsObsData, setAccountsObsData] = useState<SubjectInfo>({});

  const [error, setError] = useState<Error | null>(null);
  const [signer, setSigner] = useState<InjectedSigner | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [walletToUse, setWalletToUse] = useState<Wallet | null>(null);
  const [supportedWallets, setSupportedWallets] = useState<Wallet[]>([]);

  const selectAccount = useCallback(
    (address: string) => {
      setAccount(accounts.find((acc) => acc.address === address) ?? null);
    },
    [accounts]
  );

  const getWalletBySource = useCallback(
    (source: WalletSource) => supportedWallets.find((item) => item.extensionName === source),
    [supportedWallets]
  );

  const connectWallet = useCallback(
    async (source: WalletSource) => {
      const wallet = getWalletBySource(source);

      if (wallet) {
        try {
          setWalletToUse({ ...wallet, ...(await wallet.enable(DAPP_NAME)) });
          return true;
        } catch (error) {
          console.error(error);
          setError(error as Error);
        }
      }

      return false;
    },
    [getWalletBySource]
  );

  const disConnectWallet = useCallback(() => {
    setWalletToUse(null);
    setSigner(null);
    setAccounts([]);
    setAccount(null);
  }, []);

  useEffect(() => {
    const sub$$ = from(accountsObs.subject.asObservable()).subscribe(setAccountsObsData);

    return () => sub$$.unsubscribe();
  }, []);

  useEffect(() => {
    const readOnlyAddress = new URL(window.location.href).searchParams.get('address');
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
    accounts.forEach(({ address, meta }) => {
      keyring.saveAddress(address, meta);
    });

    setAccount(accounts.find(({ meta }) => meta.source === SEARCH_PARAMS_SOURCE) ?? accounts[0] ?? null);
  }, [accounts]);

  useEffect(() => {
    const injecteds = window.injectedWeb3;

    setSupportedWallets([
      {
        ...(injecteds['polkadot-js'] ?? []),
        extensionName: 'polkadot-js',
        title: 'Polkadot{.js}',
        installUrl:
          'https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd/related',
        installed: !!injecteds['polkadot-js'],
        logo: {
          src: '/image/wallet/polkadot-js.svg',
          alt: 'Polkadotjs Logo',
        },
      },
      {
        ...(injecteds['talisman'] ?? {}),
        extensionName: 'talisman',
        title: 'Talisman',
        installUrl:
          'https://chrome.google.com/webstore/detail/talisman-wallet/fijngjgcjhjmmpcmkeiomlglpeiijkld?hl=en&authuser=0',
        installed: !!injecteds['talisman'],
        logo: {
          src: '/image/wallet/talisman.svg',
          alt: 'Talisman Logo',
        },
      },
      {
        ...(injecteds['subwallet-js'] ?? {}),
        extensionName: 'subwallet-js',
        title: 'SubWallet',
        installUrl:
          'https://chrome.google.com/webstore/detail/subwallet/onhogfjeacnfoofkfgppdlbmlmnplgbn?hl=en&authuser=0',
        installed: !!injecteds['subwallet-js'],
        logo: {
          src: '/image/wallet/subwallet-js.svg',
          alt: 'Subwallet Logo',
        },
      },
    ]);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        error,
        signer,
        account,
        accounts,
        walletToUse,
        supportedWallets,
        selectAccount,
        connectWallet,
        disConnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
