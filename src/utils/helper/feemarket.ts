import { CrossChainDestination } from '../../model';

export const getFeeMarketModule = (dest: CrossChainDestination): string => {
  switch (dest) {
    case CrossChainDestination.Darwinia:
      return 'darwiniaFeeMarket';
    case CrossChainDestination.Pangoro:
      return 'pangoroFeeMarket';
    case CrossChainDestination.CrabParachain:
      return 'crabParachainFeeMarket';
    case CrossChainDestination.PangolinParachain:
      return 'pangolinParachainFeeMarket';
    default:
      return 'feeMarket';
  }
};
