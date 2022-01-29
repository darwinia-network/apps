import type ExtType from '@polkadot/extension-inject/types';
import BN from 'bn.js';
import { DarwiniaAsset } from './common';
import { WithOptional } from './type-operator';

export type InjectedAccountWithMeta = ExtType.InjectedAccountWithMeta;

export type IAccountMeta = WithOptional<InjectedAccountWithMeta, 'meta'>;

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
