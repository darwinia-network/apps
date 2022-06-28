import { createContext, PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CrossChainDestination, PolkadotTypeNetwork, SearchParamsKey } from '../model';
import { useApi } from '../hooks';

const networksDestinations: Record<PolkadotTypeNetwork, CrossChainDestination[]> = {
  crab: [],
  // crab: ['Darwinia', 'CrabParachain'],
  darwinia: [],
  pangolin: ['PangolinParachain', 'Pangoro'],
  pangoro: [],
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

  const searchParams = new URLSearchParams(search);
  const dest = searchParams.get(SearchParamsKey.DESTINATION);

  const supportedDestinations = useMemo(
    () => networksDestinations[network.name as PolkadotTypeNetwork] || [],
    [network.name]
  );
  const [destination, setDestination] = useState<CrossChainDestination>(
    supportedDestinations.find((item) => item === dest) ?? supportedDestinations[0]
  );

  useEffect(() => {
    setDestination(supportedDestinations[0]);
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
