import type { FeeMarketApiSection, DarwiniaChain } from '../model';

export const marketApiSections = {
  Crab: {
    Darwinia: ['feeMarket', 'darwiniaFeeMarket'],
    'Crab Parachain': ['crabParachainFeeMarket'],
  },
  Darwinia: {
    Crab: ['feeMarket', 'crabFeeMarket'],
  },
  Pangolin: {
    Pangoro: ['feeMarket', 'pangoroFeeMarket'],
    'Pangolin Parachain': ['pangolinParachainFeeMarket'],
  },
  Pangoro: {
    Pangolin: ['feeMarket', 'pangolinFeeMarket'],
  },
} as Record<DarwiniaChain, Record<DarwiniaChain, FeeMarketApiSection[]>>;
