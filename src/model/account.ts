import type ExtType from '@polkadot/extension-inject/types';
import { KeyringJson } from '@polkadot/ui-keyring/types';
import type { BN } from '@polkadot/util';
import type { Balance } from '@polkadot/types/interfaces';
import { DarwiniaAsset } from './common';

export type InjectedAccountWithMeta = ExtType.InjectedAccountWithMeta;

export interface IAccountMeta extends InjectedAccountWithMeta {
  json?: KeyringJson;
}

export interface Token<T = string> {
  symbol: T;
  decimal: string;
}

export interface Chain {
  tokens: Token[];
  ss58Format: string;
}
export interface AvailableBalance<T = DarwiniaAsset> {
  max: string | number | BN;
  asset: T;
  token: Token;
}
export interface Asset extends AvailableBalance {
  total: Balance | BN;
}

export interface Fund extends Asset {
  amount: string;
}

export interface AssetOverviewProps {
  asset: Asset;
  loading?: boolean | undefined;
  refresh: (acc?: string) => void;
}
