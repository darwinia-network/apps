import { THEME } from '../config';
import { HashInfo } from '../utils';
import { ChainConfig, Network, PolkadotChainConfig } from './network';

export interface StorageInfo extends HashInfo {
  theme?: THEME;
  activeAccount?: string;
  activeNetwork?: PolkadotChainConfig;
  config?: Partial<{ [key in Network]: ChainConfig }>;
  custom?: Network[];
}
