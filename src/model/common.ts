export interface Action<U, T = string> {
  type: U;
  payload: T;
}

export type Config<T extends string, U> = { [key in T]: U };

export type CrossType = 'cross-chain' | 'airdrop';

export enum DarwiniaAsset {
  ring = 'ring',
  kton = 'kton',
}

export interface IModalProps<T = unknown> {
  account?: string;
  isVisible: boolean;
  confirm?: (account: T) => void;
  cancel: () => void;
}

export enum SearchParamsKey {
  RPC = 'rpc',
  TAB = 'tab',
  ORDER = 'order',
  RELAYER = 'relayer',
  DESTINATION = 'dest',
}
