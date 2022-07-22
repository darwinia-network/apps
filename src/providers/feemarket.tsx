import { createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CrossChainDestination, PolkadotTypeNetwork, SearchParamsKey } from '../model';
import { useApi } from '../hooks';

const networksDestinations: Record<PolkadotTypeNetwork, CrossChainDestination[]> = {
  crab: ['Darwinia', 'CrabParachain'],
  darwinia: [],
  pangolin: ['PangolinParachain', 'Pangoro'],
  pangoro: [],
  'crab-parachain': [],
  'pangolin-parachain': [],
};

export interface FeeMarketCtx {
  destination: CrossChainDestination | null | undefined;
  supportedDestinations: CrossChainDestination[];

  setDestination: (dest: CrossChainDestination) => void;
}

export const FeeMarketContext = createContext<FeeMarketCtx>({} as FeeMarketCtx);

export const FeeMarketProvider = ({ children }: PropsWithChildren<unknown>) => {
  const { network } = useApi();
  const { search } = useLocation();
  const navigate = useNavigate();

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
      const searchParamsReplace = new URLSearchParams(window.location.search);
      searchParamsReplace.set(SearchParamsKey.DESTINATION, d);
      navigate(`?${searchParamsReplace.toString()}`);

      _setDestination(d);
    },
    [navigate]
  );

  useEffect(() => {
    _setDestination(supportedDestinations[0]);
  }, [supportedDestinations]);

  return (
    <FeeMarketContext.Provider
      value={{
        destination,
        supportedDestinations,
        setDestination,
      }}
    >
      {children}
    </FeeMarketContext.Provider>
  );
};
