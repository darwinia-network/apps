export type PolkadotTypeNetwork =
  | 'pangolin'
  | 'crab'
  | 'darwinia'
  | 'pangoro'
  | 'crab-parachain'
  | 'pangolin-parachain';

export type EthereumTypeNetwork = 'ethereum' | 'ropsten' | 'crab' | 'pangolin';

type TronTypeNetwork = 'tron';

export type Network = PolkadotTypeNetwork | EthereumTypeNetwork | TronTypeNetwork;

export type NetworkCategory = 'polkadot' | 'ethereum' | 'darwinia' | 'dvm' | 'tron';

export type NetworkMode = 'native' | 'dvm';
