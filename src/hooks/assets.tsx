import { useState, useCallback, useEffect } from 'react';
import { forkJoin, EMPTY } from 'rxjs';
import type { AccountData } from '@darwinia/types';
import { useApi } from '../hooks';
import { SYSTEM_NETWORK_CONFIGURATIONS } from '../config';
import { Asset, DarwiniaAsset, Token, Network } from '../model';
import { getDarwiniaBalances } from '../utils';

const getToken = (tokens: Token[], network: Network, target: DarwiniaAsset) => {
  const networkTokens = SYSTEM_NETWORK_CONFIGURATIONS.find((v) => v.name === network)?.tokens;
  const result = tokens.find((token) => networkTokens && token.symbol === networkTokens[target].symbol);
  const unknown: Token = { symbol: 'unknown', decimal: '9' };

  return result || unknown;
};

export const useAssets = (account: string) => {
  const { network, api, chain } = useApi();
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);

  const getAssets = useCallback(
    (acc?: string) => {
      if (!(acc || account) || chain.ss58Format !== network.ss58Prefix.toString()) {
        return EMPTY.subscribe();
      }

      setLoading(true);

      return forkJoin([
        getDarwiniaBalances(api, acc ?? account),
        api.query.system.account(account) as Promise<{ data: AccountData }>,
      ]).subscribe({
        next: ([
          [ring, kton],
          {
            data: { free, freeKton },
          },
        ]) => {
          setAssets([
            {
              max: ring,
              asset: DarwiniaAsset.ring,
              total: free.toNumber(),
              token: getToken(chain.tokens, network.name, DarwiniaAsset.ring),
            },
            {
              max: kton,
              asset: DarwiniaAsset.kton,
              total: freeKton.toNumber(),
              token: getToken(chain.tokens, network.name, DarwiniaAsset.kton),
            },
          ]);
          setLoading(false);
        },
        error: () => setLoading(false),
      });
    },
    [account, api, network, chain]
  );

  useEffect(() => {
    if (account || chain.ss58Format !== network.ss58Prefix.toString()) {
      return;
    }

    setAssets([
      {
        max: 0,
        asset: DarwiniaAsset.ring,
        total: 0,
        token: getToken(chain.tokens, network.name, DarwiniaAsset.ring),
      },
      {
        max: 0,
        asset: DarwiniaAsset.kton,
        total: 0,
        token: getToken(chain.tokens, network.name, DarwiniaAsset.kton),
      },
    ]);
  }, [network, account, chain]);

  useEffect(() => {
    const sub$$ = getAssets(account);
    return () => {
      sub$$.unsubscribe();
      setLoading(false);
    };
  }, [account, getAssets]);

  return { assets, loading, getAssets };
};
