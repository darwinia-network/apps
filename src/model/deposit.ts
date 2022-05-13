/**
 * api repo: https://github.com/evolutionlandorg/evo-backend/blob/main/docs/wiki.md#trade-list
 */
export interface Deposit {
  amount: string; // RING
  reward: string; // KTON
  deposit_id: number;
  deposit_time: number; // timestamp
  withdraw_time: number; // timestamp
  duration: number; // month amount
  deposit_tx: string;
  withdraw_tx: string;
}

export type DepositResponse = { list: Deposit[] };

export interface DepositRequest {
  owner: string;
  'EVO-NETWORK': 'Eth' | 'Tron' | 'Crab' | 'Polygon';
}
