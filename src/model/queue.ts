import { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import { SubmittableResult } from '@polkadot/api';
import { AccountId, Address } from '@polkadot/types/interfaces';
import { DefinitionRpcExt } from '@polkadot/types/types';

export type Actions = 'create' | 'edit' | 'restore' | 'forget' | 'backup' | 'changePassword' | 'transfer';

export interface ActionStatusBase {
  account?: AccountId | Address | string;
  message?: string;
  status: 'error' | 'event' | 'eventWarn' | 'queued' | 'received' | 'success';
}

export interface ActionStatus extends ActionStatusBase {
  action: Actions | string | string[];
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

export interface QueueTx {
  error?: Error;
  extrinsic?: SubmittableExtrinsic;
  id: number;
  signer: string;
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
  extrinsic?: SubmittableExtrinsic;
  signer: string;
}

export interface QueueTxRpc {
  rpc: DefinitionRpcExt;
  values: unknown[];
  signer: string;
}

export interface PartialQueueTxExtrinsic {
  extrinsic?: SubmittableExtrinsic;
  txFailedCb?: TxFailedCallback;
  txSuccessCb?: TxCallback;
  txStartCb?: () => void;
  txUpdateCb?: TxCallback;
  signer: string;
}

export interface PartialQueueTxRpc {
  rpc: DefinitionRpcExt;
  values: unknown[];
  signer: string;
}

export type QueueTxRpcAdd = (value: PartialQueueTxRpc) => void;

export type QueueTxExtrinsicAdd = (value: PartialQueueTxExtrinsic) => void;

export type QueueTxMessageSetStatus = (
  id: number,
  status: QueueTxStatus,
  result?: SubmittableResult,
  error?: Error
) => void;
