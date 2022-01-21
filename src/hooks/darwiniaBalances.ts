import { useCallback, useEffect, useState } from 'react';
import { from } from 'rxjs';
import { Asset, DarwiniaAsset, TokenChainInfo } from '../model';
import { getDarwiniaBalances } from '../utils';
import { useAccount } from './account';
import { useApi } from './api';

export const getChainInfo: (tokens: TokenChainInfo[], target: DarwiniaAsset) => TokenChainInfo | undefined = (
  tokens: TokenChainInfo[],
  target: DarwiniaAsset
) => {
  if (target) {
    return tokens.find((token) => token.symbol.toLowerCase().includes(target.toLowerCase()));
  }

  return;
};

export function useDarwiniaAvailableBalances() {
  const { api, chain, network } = useApi();
  const { account } = useAccount();
  const [availableBalance, setAvailableBalance] = useState<Asset[]>([]);
  const getBalances = useCallback(
    async (acc?: string) => {
      if (!api) {
        return [];
      }

      const [ring, kton] = await getDarwiniaBalances(api, acc ?? account);
      const info = await api.query.system.account(account);
      const {
        data: { free, freeKton },
      } = info.toJSON() as {
        data: { free: number; freeKton: number; reserved: number; reservedKton: number };
      };
      const res = [
        {
          max: ring,
          asset: DarwiniaAsset.ring,
          total: free,
          chainInfo: getChainInfo(chain.tokens, network.name === 'crab' ? DarwiniaAsset.crab : DarwiniaAsset.ring),
        },
        {
          max: kton,
          asset: DarwiniaAsset.kton,
          total: freeKton,
          chainInfo: getChainInfo(chain.tokens, DarwiniaAsset.kton),
        },
      ];

      setAvailableBalance(res);
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

  return { getBalances, availableBalance, setAvailableBalance };
}
