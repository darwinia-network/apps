import { THEME } from '../config';
import { HashInfo } from '../utils';
import { Network, ChainConfig } from './network';

export interface StorageInfo extends HashInfo {
  theme?: THEME;
  activeAccount?: string;
  enableTestNetworks?: boolean;
  config?: Partial<{ [key in Network]: ChainConfig }>;
  custom?: Network[];
}
