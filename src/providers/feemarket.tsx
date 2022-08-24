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
  const [refresh, setRefresh] = useState<() => void>(() => () => undefined);

  const searchParams = new URLSearchParams(search);
  const dest = searchParams.get(SearchParamsKey.DESTINATION);

  const supportedDestinations = useMemo(() => {
    const { specName } = api.consts.system.version as RuntimeVersion;
    const source = specName.toString() as DarwiniaChain;
    return Object.keys(marketApiSections[source] || {}) as DarwiniaChain[];
  }, [api]);

  const [destination, _setDestination] = useState<DarwiniaChain>(
    supportedDestinations.find((item) => item === dest) ?? supportedDestinations[0]
  );

  const setDestination = useCallback(
    (d: DarwiniaChain) => {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set(SearchParamsKey.DESTINATION, d);
      navigate(`?${searchParams.toString()}`);

      _setDestination(d);
    },
    [navigate]
  );

  useEffect(() => {
    _setDestination(supportedDestinations.find((item) => item === dest) ?? supportedDestinations[0]);
  }, [supportedDestinations, dest]);

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
