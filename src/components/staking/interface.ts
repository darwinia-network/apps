import type { Balance, BlockNumber } from '@polkadot/types/interfaces';
import { Token } from '../../model';

export interface AccountHistoryProps {
  tokens: (Token | undefined)[];
}

export enum StakingRecordType {
  LOCKED = 'Locked',
  UNBONDING = 'Unbonding',
  UNBONDED = 'Unbonded',
}

export enum UnbondType {
  UNBONDED = 'Unbonded',
  UNBONDING = 'Unbonding',
}

export interface UnbondDataSourceState {
  amount: Balance;
  until: BlockNumber;
  status: UnbondType;
  symbol: string;
}
