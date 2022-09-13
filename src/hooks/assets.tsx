import { useState, useCallback, useEffect } from 'react';
import { from, EMPTY } from 'rxjs';
import { BN_ZERO } from '@polkadot/util';
import { useApi } from '../hooks';
import { Asset, DarwiniaAsset } from '../model';
import { getDarwiniaBalances } from '../utils';

export const useAssets = (account?: string | null) => {
  const { network, api, chain } = useApi();
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([
    {
      max: BN_ZERO,
      asset: DarwiniaAsset.ring,
      total: BN_ZERO,
      token: network.tokens.ring,
    },
    {
      max: BN_ZERO,
      asset: DarwiniaAsset.kton,
      total: BN_ZERO,
      token: network.tokens.kton,
    },
  ]);

  const getAssets = useCallback(() => {
    if (account && chain.ss58Format === network.ss58Prefix.toString()) {
      setLoading(true);

      return from(getDarwiniaBalances(api, account)).subscribe({
        next: ([ringBalance, ktonBalance, freeRing, freeKton]) => {
          setAssets([
            {
              max: ringBalance,
              asset: DarwiniaAsset.ring,
              total: freeRing,
              token: network.tokens.ring,
            },
            {
              max: ktonBalance,
              asset: DarwiniaAsset.kton,
              total: freeKton,
              token: network.tokens.kton,
            },
          ]);
          setLoading(false);
        },
        error: () => setLoading(false),
      });
    } else {
      return EMPTY.subscribe();
    }
  }, [account, api, network, chain]);

  useEffect(() => {
    const sub$$ = getAssets();

    return () => {
      sub$$.unsubscribe();
      setLoading(false);
    };
  }, [getAssets]);

  return { assets, loading, refresh: getAssets };
};
