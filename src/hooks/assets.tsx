import { useState, useCallback, useEffect } from 'react';
import { forkJoin, EMPTY, from } from 'rxjs';
import type { AccountData } from '@darwinia/types';
import type { u32 } from '@polkadot/types-codec';
import type { ChainProperties } from '@polkadot/types/interfaces';
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

const extractTokens = ({ tokenDecimals, tokenSymbol }: ChainProperties) =>
  tokenDecimals.isSome && tokenSymbol.isSome
    ? tokenDecimals.unwrap().reduce((acc: Token[], decimal: u32, index: number) => {
        const token: Token = { decimal: decimal.toString(), symbol: tokenSymbol.unwrap()[index].toString() };
        return [...acc, token];
      }, [])
    : [];

export const useAssets = (account: string) => {
  const { network, api } = useApi();
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);

  const getAssets = useCallback(
    (acc?: string) => {
      if (!(acc || account)) {
        return EMPTY.subscribe();
      }

      setLoading(true);

      return forkJoin([
        api.rpc.system.properties(),
        getDarwiniaBalances(api, acc ?? account),
        api.query.system.account(account) as Promise<{ data: AccountData }>,
      ]).subscribe({
        next: ([
          properties,
          [ring, kton],
          {
            data: { free, freeKton },
          },
        ]) => {
          const tokens = extractTokens(properties);

          setAssets([
            {
              max: ring,
              asset: DarwiniaAsset.ring,
              total: free.toNumber(),
              token: getToken(tokens, network.name, DarwiniaAsset.ring),
            },
            {
              max: kton,
              asset: DarwiniaAsset.kton,
              total: freeKton.toNumber(),
              token: getToken(tokens, network.name, DarwiniaAsset.kton),
            },
          ]);
          setLoading(false);
        },
        error: () => setLoading(false),
      });
    },
    [account, api, network.name]
  );

  useEffect(() => {
    if (account) {
      return;
    }
    setLoading(true);

    const sub$$ = from(api.rpc.system.properties()).subscribe({
      next: (properties) => {
        const tokens = extractTokens(properties);

        setAssets([
          {
            max: 0,
            asset: DarwiniaAsset.ring,
            total: 0,
            token: getToken(tokens, network.name, DarwiniaAsset.ring),
          },
          {
            max: 0,
            asset: DarwiniaAsset.kton,
            total: 0,
            token: getToken(tokens, network.name, DarwiniaAsset.kton),
          },
        ]);
        setLoading(false);
      },
      error: () => setLoading(false),
    });

    return () => {
      sub$$.unsubscribe();
      setLoading(false);
    };
  }, [api, network.name, account]);

  useEffect(() => {
    const sub$$ = getAssets(account);
    return () => {
      sub$$.unsubscribe();
      setLoading(false);
    };
  }, [account, getAssets]);

  return { assets, loading, getAssets };
};
