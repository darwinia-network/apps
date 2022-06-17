import { createContext, PropsWithChildren, useState } from 'react';
import { CrossChainDestination, PolkadotTypeNetwork } from '../model';

const supportedDestinations: Record<PolkadotTypeNetwork, CrossChainDestination[]> = {
  crab: ['Darwinia', 'CrabParachain'],
  darwinia: [],
  pangolin: ['Pangoro', 'PangolinParachain'],
  pangoro: [],
};

export interface FeeMarketCtx {
  destination: CrossChainDestination;
  supportedDestinations: Record<PolkadotTypeNetwork, CrossChainDestination[]>;

  setDestination: (dest: CrossChainDestination) => void;
}

export const FeeMarketContext = createContext<FeeMarketCtx>({} as FeeMarketCtx);

export const FeeMarketProvider = ({ children }: PropsWithChildren<unknown>) => {
  const [destination, setDestination] = useState<CrossChainDestination>('Default');

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
