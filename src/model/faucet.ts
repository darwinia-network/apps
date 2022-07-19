export enum FaucetResponseCode {
  SUCCESS_TRANSFER = 1000, // eslint-disable-line no-magic-numbers
  SUCCESS_PRECHECK,
  FAILED_THROTTLE,
  FAILED_PARAMS,
  FAILED_INSUFFICIENT, // faucet pool is insufficient balance
  FAILED_EXTRINSIC,
  FAILED_OTHER,
}

export interface FaucetResponse<T = null> {
  code: FaucetResponseCode;
  message: string;
  data: T;
}

export interface FaucetThrottleData {
  lastTime: number; // milliseconds
  throttleHours: number;
}

export interface FaucetTransferData {
  txHash: string;
}
