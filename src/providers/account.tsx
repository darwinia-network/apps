import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { from } from 'rxjs';
import { useApi } from '../hooks';
import { Asset, DarwiniaAsset, IAccountMeta, Token } from '../model';
import { convertToSS58, getDarwiniaBalances, isSameAddress, readStorage, updateStorage } from '../utils';

export interface AccountCtx {
  account: string;
  setAccount: (account: string) => void;
  accountWithMeta: IAccountMeta;
  assets: Asset[];
  getBalances: (acc?: string) => void;
}

const getToken: (tokens: Token[], target: DarwiniaAsset) => Token = (tokens: Token[], target: DarwiniaAsset) => {
  const result = tokens.find((token) => token.symbol.toLowerCase().includes(target.toLowerCase()));
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

      // Be careful we are in a asynchronous function
      const token1 = getToken(chain.tokens, network.name === 'crab' ? DarwiniaAsset.crab : DarwiniaAsset.ring);
      const token2 = getToken(chain.tokens, DarwiniaAsset.kton);
      if (token1.symbol === 'unknown') {
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
          token: token1,
        },
        {
          max: kton,
          asset: DarwiniaAsset.kton,
          total: freeKton,
          token: token2,
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
    const accStorage = readStorage().activeAccount;
    const acc =
      account ||
      connection?.accounts.find((value) => value.address === accStorage)?.address ||
      connection?.accounts[0]?.address;

    if (!acc) {
      return;
    }

    const ss58Account = convertToSS58(acc, network.ss58Prefix);

    setAccount(ss58Account);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network.ss58Prefix, connection]);

  useEffect(() => {
    updateStorage({ activeAccount: account });
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
