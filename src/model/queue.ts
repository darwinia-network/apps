import { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import { SubmittableResult } from '@polkadot/api';
import { AccountId, Address } from '@polkadot/types/interfaces';
import { DefinitionRpcExt, AnyNumber } from '@polkadot/types/types';

export type Actions = 'create' | 'edit' | 'restore' | 'forget' | 'backup' | 'changePassword' | 'transfer';

export interface ActionStatus {
  action: Actions | string | string[];
  account?: AccountId | Address | string;
  message?: string;
  status: 'error' | 'event' | 'eventWarn' | 'queued' | 'received' | 'success';
}

export type QueueTxStatus =
  | 'future'
  | 'ready'
  | 'finalized'
  | 'finalitytimeout'
  | 'usurped'
  | 'dropped'
  | 'inblock'
  | 'invalid'
  | 'broadcast'
  | 'cancelled'
  | 'completed'
  | 'error'
  | 'incomplete'
  | 'queued'
  | 'qr'
  | 'retracted'
  | 'sending'
  | 'signing'
  | 'sent'
  | 'blocked';

export type TxCallback = (status: SubmittableResult) => void;

export type TxFailedCallback = (status: Error | SubmittableResult | null) => void;

export interface QueueStatus extends ActionStatus {
  id: number;
  isCompleted: boolean;
  removeItem: () => void;
}

export interface QueueTxResult {
  error?: Error;
  result?: unknown;
  status: QueueTxStatus;
}

export interface QueueTxExtrinsic {
  nonce?: AnyNumber;
  extrinsic?: SubmittableExtrinsic;
  signAddress?: string | null;
  txFailedCb?: TxFailedCallback;
  txSuccessCb?: TxCallback;
  txStartCb?: () => void;
  txUpdateCb?: TxCallback;
}

export interface QueueTxRpc {
  rpc: DefinitionRpcExt;
  values: unknown[];
  signAddress?: string | null;
}

export interface QueueTx {
  error?: Error;
  extrinsic?: SubmittableExtrinsic;
  id: number;
  nonce?: AnyNumber;
  signAddress?: string | null;
  result?: unknown;
  removeItem: () => void;
  rpc: DefinitionRpcExt;
  txFailedCb?: TxFailedCallback;
  txSuccessCb?: TxCallback;
  txStartCb?: () => void;
  txUpdateCb?: TxCallback;
  values?: unknown[];
  status: QueueTxStatus;
}

export type QueueTxRpcAdd = (value: QueueTxRpc) => void;

export type QueueTxExtrinsicAdd = (value: QueueTxExtrinsic) => void;

export type QueueTxMessageSetStatus = (
  id: number,
  status: QueueTxStatus,
  result?: SubmittableResult,
  error?: Error
) => void;
