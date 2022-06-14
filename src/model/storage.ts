import { THEME } from '../config';
import { HashInfo } from '../utils';
import { ChainConfig, Network, PolkadotChainConfig } from './network';
import { WalletSource } from './wallet';

export interface StorageInfo extends HashInfo {
  theme?: THEME;
  activeWallet: WalletSource;
  activeAccount?: string;
  activeNetwork?: PolkadotChainConfig;
  config?: Partial<{ [key in Network]: ChainConfig }>;
  custom?: Network[];
  hidePortalWarning?: boolean;
  introIndex?: number;
}
