import { AddEthereumChainParameter } from '../metamask';
import { DarwiniaAsset } from '../common';
import type { Token } from '../account';
import { Facade } from './facade';
import { Network, NetworkCategory } from './network';

export interface EVMToken {
  address: string; // The address of the token contract
  symbol: string; // A ticker symbol or shorthand, up to 5 characters
  decimals: number; // The number of token decimals
}

interface EVMTokenConfig {
  ring: EVMToken;
  kton?: EVMToken;
}

interface ProviderConfig {
  rpc: string;
}

export interface ChainConfig {
  facade: Facade;
  category: 'live' | 'test' | 'parachain';
  name: Network;
  provider: ProviderConfig;
  type: NetworkCategory[];
  tokens: {
    [key in DarwiniaAsset]: Token;
  };
}

export interface EthereumChainConfig extends ChainConfig {
  ethereumChain: AddEthereumChainParameter;
}

export interface PolkadotChainConfig extends ChainConfig {
  ss58Prefix: number;
  subquery?: {
    endpoint: string;
  };
}

export interface EVMChainConfig extends EthereumChainConfig, PolkadotChainConfig {
  evm: EVMTokenConfig;
}
