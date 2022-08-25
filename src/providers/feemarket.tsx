import { createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RuntimeVersion } from '@polkadot/types/interfaces';

import { marketApiSections } from '../config';
import { SearchParamsKey, DarwiniaChain } from '../model';
import { useApi } from '../hooks';

export interface FeeMarketCtx {
  destination: DarwiniaChain | null | undefined;
  supportedDestinations: DarwiniaChain[];

  setDestination: (destination: DarwiniaChain) => void;
  refresh: () => void;
  setRefresh: (fn: () => void) => void;
}

export const FeeMarketContext = createContext<FeeMarketCtx>({} as FeeMarketCtx);

export const FeeMarketProvider = ({ children }: PropsWithChildren<unknown>) => {
  const { api } = useApi();
  const { search } = useLocation();
  const navigate = useNavigate();
  const [destination, _setDestination] = useState<DarwiniaChain | null>();
  const [refresh, setRefresh] = useState<() => void>(() => () => undefined);

  const searchParams = new URLSearchParams(search);
  const paramDestination = searchParams.get(SearchParamsKey.DESTINATION);

  const supportedDestinations = useMemo(() => {
    const { specName } = api.consts.system.version as RuntimeVersion;
    const source = specName.toString() as DarwiniaChain;
    return Object.keys(marketApiSections[source] || {}) as DarwiniaChain[];
  }, [api]);

  const setDestination = useCallback(
    (dest: DarwiniaChain) => {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set(SearchParamsKey.DESTINATION, dest);
      navigate(`?${searchParams.toString()}`);

      _setDestination(dest);
    },
    [navigate]
  );

  useEffect(() => {
    _setDestination(supportedDestinations.find((dest) => dest === paramDestination) ?? supportedDestinations[0]);
  }, [supportedDestinations, paramDestination]);

  return (
    <FeeMarketContext.Provider
      value={{
        destination,
        supportedDestinations,
        refresh,
        setRefresh,
        setDestination,
      }}
    >
      {children}
    </FeeMarketContext.Provider>
  );
};
