import type { Balance } from '@polkadot/types/interfaces';
import { Token } from '../../model';

export interface AccountHistoryProps {
  tokens: (Token | undefined)[];
}

export enum StakingRecordType {
  LOCKS = 'Locks',
  UNBONDING = 'Unbonding',
  UNBONDED = 'Unbonded',
}

export enum UnbondType {
  UNBONDED = 'Unbonded',
  UNBONDING = 'Unbonding',
}

export interface UnbondDataSourceState {
  amount: Balance;
  until: string;
  status: UnbondType;
  symbol: string;
}
