import { createContext, PropsWithChildren, useState } from 'react';
import type { CrossChainDestination, PolkadotTypeNetwork } from '../model';
import { useApi } from '../hooks';

const supportedDestinations: Record<PolkadotTypeNetwork, CrossChainDestination[]> = {
  crab: ['Darwinia', 'CrabParachain'],
  darwinia: [],
  pangolin: ['Pangoro', 'PangolinParachain'],
  pangoro: [],
};

export interface FeeMarketCtx {
  destination: CrossChainDestination;
  supportedDestinations: typeof supportedDestinations;

  setDestination: (dest: CrossChainDestination) => void;
}

export const FeeMarketContext = createContext<FeeMarketCtx>({} as FeeMarketCtx);

export const FeeMarketProvider = ({ children }: PropsWithChildren<unknown>) => {
  const { network } = useApi();
  const [destination, setDestination] = useState<CrossChainDestination>(
    supportedDestinations[network.name as PolkadotTypeNetwork][0] ?? 'Default'
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
