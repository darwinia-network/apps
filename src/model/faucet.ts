export enum FaucetResponseCode {
  SUCCESS = 1000, // eslint-disable-line no-magic-numbers
  FAILED_THROTTLE,
  FAILED_PARAMS,
  FAILED_INSUFFICIENT, // faucet pool is insufficient balance
  FAILED_OTHER,
}

export interface FaucetResponse<T = null> {
  code: FaucetResponseCode;
  message: string;
  data: T;
}

export interface FaucetThrottleData {
  lastClaimTime: number; // timestamp
}

export interface FaucetTransferData {
  txHash: string;
}
