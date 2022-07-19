export enum ResponseCode {
  SUCCESS_TRANSFER = 1000, // eslint-disable-line no-magic-numbers
  SUCCESS_PRECHECK,
  FAILED_THROTTLE,
  FAILED_PARAMS,
  FAILED_INSUFFICIENT, // faucet pool is insufficient balance
  FAILED_EXTRINSIC,
  FAILED_OTHER,
}

export interface ResponseBody<T = null> {
  code: ResponseCode;
  message: string;
  data: T;
}

export interface ThrottleData {
  lastTime: number; // milliseconds
  throttleHours: number;
}

export interface TransferData {
  txHash: string;
}

export interface Config {
  seed?: string;
  endpoint: string;
  throttleHours: number;
  transferMount: number;
}
