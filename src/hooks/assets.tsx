import { useState, useCallback, useEffect } from 'react';
import { forkJoin, EMPTY } from 'rxjs';
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
  const [assets, setAssets] = useState<Asset[]>([]);
  const { network, chain, api } = useApi();

  const getAssets = useCallback(
    (acc?: string) => {
      const tokenRing = getToken(chain.tokens, network.name, DarwiniaAsset.ring);
      const tokenKton = getToken(chain.tokens, network.name, DarwiniaAsset.kton);
      if (tokenRing.symbol === 'unknown' || tokenKton.symbol === 'unknown') {
        return EMPTY.subscribe();
      }

      return forkJoin([
        getDarwiniaBalances(api, acc ?? account),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        api.query.system.account(account) as Promise<any>,
      ]).subscribe(([[ring, kton], info]) => {
        const {
          data: { free, freeKton },
        } = info.toJSON() as {
          data: { free: number; freeKton: number; reserved: number; reservedKton: number };
        };

        setAssets([
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
        ]);
      });
    },
    [account, api, chain.tokens, network.name]
  );

  useEffect(() => {
    if (!account) {
      return;
    }

    const sub$$ = getAssets(account);
    return () => sub$$.unsubscribe();
  }, [account, getAssets]);

  return { assets, getAssets };
};
