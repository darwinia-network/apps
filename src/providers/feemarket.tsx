import { createContext, PropsWithChildren, useMemo, useState } from 'react';
import type { CrossChainDestination, PolkadotTypeNetwork } from '../model';
import { useApi } from '../hooks';

const networksDestinations: Record<PolkadotTypeNetwork, CrossChainDestination[]> = {
  crab: [],
  // crab: ['Darwinia', 'CrabParachain'],
  darwinia: [],
  pangolin: ['Pangoro', 'PangolinParachain'],
  pangoro: [],
};

export interface FeeMarketCtx {
  destination: CrossChainDestination;
  supportedDestinations: CrossChainDestination[];

  setDestination: (dest: CrossChainDestination) => void;
}

export const FeeMarketContext = createContext<FeeMarketCtx>({} as FeeMarketCtx);

export const FeeMarketProvider = ({ children }: PropsWithChildren<unknown>) => {
  const dest = new URL(window.location.href).searchParams.get('dest');
  const { network } = useApi();
  const supportedDestinations = useMemo(
    () => networksDestinations[network.name as PolkadotTypeNetwork] || [],
    [network.name]
  );
  const [destination, setDestination] = useState<CrossChainDestination>(
    supportedDestinations.find((item) => item === dest) ?? supportedDestinations[0] ?? 'Default'
  );

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
