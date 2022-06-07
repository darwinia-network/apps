import { PropsWithChildren, useState, createContext, useCallback, useEffect } from 'react';
import type { Signer as InjectedSigner } from '@polkadot/api/types';
import { Unsubcall } from '@polkadot/extension-inject/types';
import type { Wallet, Account, WalletSource } from '../model';
import { DAPP_NAME } from '../config';
import { convertToSS58 } from '../utils';
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
  const { network } = useApi();

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
          setWalletToUse(await wallet.enable(DAPP_NAME));
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
    let sub$$: Unsubcall;

    if (walletToUse) {
      setSigner(walletToUse.signer);

      sub$$ = walletToUse.accounts.subscribe((accs) => {
        setAccounts(
          accs.map((acc) => {
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
          })
        );
      });
    }

    return () => {
      if (sub$$) {
        sub$$();
      }
    };
  }, [walletToUse, network.ss58Prefix]);

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
