import { CrossChainDestination } from '../../model';

// eslint-disable-next-line complexity
export const getFeeMarketModule = (dest: CrossChainDestination): string => {
  switch (dest) {
    case 'Crab':
      return 'crabFeeMarket';
    case 'Darwinia':
      return 'darwiniaFeeMarket';
    case 'Pangoro':
      return 'pangoroFeeMarket';
    case 'Pangolin':
      return 'pangolinFeeMarket';
    case 'CrabParachain':
      return 'crabParachainFeeMarket';
    case 'PangolinParachain':
      return 'pangolinParachainFeeMarket';
    case 'Default':
    default:
      return 'feeMarket';
  }
};
