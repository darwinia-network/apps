import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { from } from 'rxjs';
import { useApi } from '../hooks';
import { SYSTEM_NETWORK_CONFIGURATIONS } from '../config';
import { Asset, DarwiniaAsset, IAccountMeta, Token, Network } from '../model';
import { convertToSS58, getDarwiniaBalances, isSameAddress, readStorage, updateStorage } from '../utils';

export interface AccountCtx {
  account: string;
  setAccount: (account: string) => void;
  accountWithMeta: IAccountMeta;
  assets: Asset[];
  getBalances: (acc?: string) => void;
}

const DEFAULT_ADDRESS_PREFIX = 42; // Substrate, 42

const getToken = (tokens: Token[], network: Network, target: DarwiniaAsset) => {
  const networkTokens = SYSTEM_NETWORK_CONFIGURATIONS.find((v) => v.name === network)?.tokens;
  const result = tokens.find((token) => networkTokens && token.symbol === networkTokens[target].symbol);
  const unknown: Token = { symbol: 'unknown', decimal: '9' };

  return result || unknown;
};

export const AccountContext = createContext<AccountCtx | null>(null);

export const AccountProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const [account, setAccount] = useState<string>('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const { network, connection, chain, api } = useApi();
  const accountWithMeta = useMemo(
    () => connection.accounts.find((item) => isSameAddress(item.address, account)) ?? connection.accounts[0],
    [account, connection]
  );

  const getBalances = useCallback(
    // eslint-disable-next-line complexity
    async (acc?: string) => {
      if (!api || !chain.tokens.length) {
        return [];
      }

      // Be careful we are in an asynchronous function
      const tokenRing = getToken(chain.tokens, network.name, DarwiniaAsset.ring);
      const tokenKton = getToken(chain.tokens, network.name, DarwiniaAsset.kton);
      if (tokenRing.symbol === 'unknown' || tokenKton.symbol === 'unknown') {
        return [];
      }

      const [ring, kton] = await getDarwiniaBalances(api, acc ?? account);
      const info = await api.query.system.account(account);

      let {
        data: { free, freeKton },
      } = info.toJSON() as {
        data: { free: number; freeKton: number; reserved: number; reservedKton: number };
      };

      // FIXME: free value of  api.query.system.account('') result is not 0, manual reset
      if (!account) {
        free = 0;
        freeKton = 0;
      }

      const res = [
        {
          max: ring,
          asset: DarwiniaAsset.ring,
          total: free,
          token: tokenRing,
        },
        {
          max: kton,
          asset: DarwiniaAsset.kton,
          total: freeKton,
          token: tokenKton,
        },
      ];

      setAssets(res);
    },
    [account, api, chain.tokens, network.name]
  );

  useEffect(() => {
    if (!api || !api.isConnected) {
      return;
    }

    const sub$$ = from(getBalances(account)).subscribe();

    return () => {
      sub$$.unsubscribe();
    };
  }, [account, api, getBalances]);

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
