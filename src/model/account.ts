import type ExtType from '@polkadot/extension-inject/types';
import { KeyringJson } from '@polkadot/ui-keyring/types';
import type { BN } from '@polkadot/util';
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

export interface DailyLimit {
  limit: string | number;
  spentToday: string | number;
}

export interface Asset extends AvailableBalance {
  total: number;
}

export interface Fund extends Asset {
  amount: string;
}

export interface AssetOverviewProps {
  asset: Asset;
  refresh: (acc?: string) => void;
}
