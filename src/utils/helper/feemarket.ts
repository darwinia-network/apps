import { CrossChainDestination } from '../../model';

export const getFeeMarketModule = (dest: CrossChainDestination): string => {
  switch (dest) {
    case 'Darwinia':
      return 'darwiniaFeeMarket';
    case 'Pangoro':
      return 'pangoroFeeMarket';
    case 'CrabParachain':
      return 'crabParachainFeeMarket';
    case 'PangolinParachain':
      return 'pangolinParachainFeeMarket';
    default:
      return 'feeMarket';
  }
};
