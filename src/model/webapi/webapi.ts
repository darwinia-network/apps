export interface WebApiRes<T> {
  code: number;
  message: string;
  generated_at: number;
  data: T;
}

export interface Pagination {
  page: number;
  row: number;
}

export interface ListRes<T> {
  count: number;
  list: T[] | null;
}

/* --------------------------------------------Account history record----------------------------------- */

export type AccountStatus = 'bonded' | 'unbonding' | 'map';

export interface AccountRecordReq extends Pagination {
  status: AccountStatus;
  locked: 0 | 1;
  address: string;
}

export interface AccountRecord {
  Id: number;
  account: string;
  extrinsic_index: string;
  start_at: number;
  month: number;
  amount: string;
  status: string;
  expired_at: number;
  unbonding_extrinsic_index: string;
  unbonding_at: number;
  unbonding_end: number;
  currency: string;
  unlock: boolean;
  account_display: AccountDisplay;
  unbonding_block_end: number;
}

export interface AccountDisplay {
  address: string;
  display: string;
  judgements?: unknown;
  account_index: string;
  identity: boolean;
  parent?: unknown;
}

export type AccountRecordListRes = ListRes<AccountRecord>;

/* --------------------------------------------Staking history----------------------------------- */

export interface StakingHistory {
  sum: string;
}
