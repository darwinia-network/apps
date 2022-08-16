import { createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CrossChainDestination, PolkadotTypeNetwork, SearchParamsKey } from '../model';
import { useApi } from '../hooks';

const networksDestinations: Record<PolkadotTypeNetwork, CrossChainDestination[]> = {
  crab: ['Darwinia', 'CrabParachain'],
  darwinia: [],
  pangolin: ['PangolinParachain', 'Pangoro'],
  pangoro: ['Pangolin'],
  'crab-parachain': [],
  'pangolin-parachain': [],
};

export interface FeeMarketCtx {
  destination: CrossChainDestination | null | undefined;
  supportedDestinations: CrossChainDestination[];

  setDestination: (dest: CrossChainDestination) => void;
  refresh: () => void;
  setRefresh: (fn: () => void) => void;
}

export const FeeMarketContext = createContext<FeeMarketCtx>({} as FeeMarketCtx);

export const FeeMarketProvider = ({ children }: PropsWithChildren<unknown>) => {
  const { network } = useApi();
  const { search } = useLocation();
  const navigate = useNavigate();
  const [refresh, setRefresh] = useState<() => void>(() => () => undefined);

  const searchParams = new URLSearchParams(search);
  const dest = searchParams.get(SearchParamsKey.DESTINATION);

  const supportedDestinations = useMemo(
    () => networksDestinations[network.name as PolkadotTypeNetwork] || [],
    [network.name]
  );
  const [destination, _setDestination] = useState<CrossChainDestination>(
    supportedDestinations.find((item) => item === dest) ?? supportedDestinations[0]
  );

  const setDestination = useCallback(
    (d: CrossChainDestination) => {
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
