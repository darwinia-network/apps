import BN from 'bn.js';
import { isString, isNumber, isUndefined, isNull } from 'lodash';
import { Unit, fromWei as web3FromWei, toWei as web3ToWei } from 'web3-utils';

export type WeiValue = string | BN | number | null | undefined;
export interface PrettyNumberOptions {
  withThousandSplit?: boolean;
  decimal?: number;
}

// eslint-disable-next-line complexity
const toStr = (value: WeiValue): string => {
  if (BN.isBN(value)) {
    return value.toString();
  } else if (isString(value)) {
    return value.replace(/,/g, '');
  } else if (isNumber(value)) {
    return String(value);
  } else if (isUndefined(value) || isNull(value) || isNaN(value)) {
    return '0';
  } else {
    throw new TypeError(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `Can not convert the value ${value} to String type. Value type is ${typeof value}`
    );
  }
};

const isDecimal = (value: number | string) => {
  return /\d+\.\d+/.test(String(value));
};

// eslint-disable-next-line complexity
export function prettyNumber(
  value: string | number | BN | null | undefined,
  { decimal }: PrettyNumberOptions = { decimal: 3 }
): string {
  if (value === null || typeof value === 'undefined') {
    return '-';
  }

  if (typeof value === 'number' || BN.isBN(value)) {
    value = value.toString();
  }

  const isDecimalNumber = isDecimal(value);
  let prefix = isDecimalNumber ? value.split('.')[0] : value;
  const suffix = isDecimalNumber
    ? completeDecimal(value.split('.')[1], decimal as number)
    : new Array(decimal).fill(0).join('');

  prefix = prefix.replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');

  const result = +suffix !== 0 ? `${prefix}.${suffix}` : prefix;

  return +result === 0 ? '0' : result;
}

export function fromWei(
  { value, unit = 'gwei' }: { value: WeiValue; unit?: Unit },
  ...fns: ((value: string) => string)[]
): string {
  return [toStr, (val: string) => web3FromWei(val || '0', unit), ...fns].reduce(
    (acc, fn) => fn(acc as string),
    value
  ) as string;
}

export function toWei(
  { value, unit = 'gwei' }: { value: WeiValue; unit?: Unit },
  ...fns: ((value: string) => string)[]
): string {
  return [toStr, (val: string) => web3ToWei(val || '0', unit), ...fns].reduce(
    (acc, fn) => fn(acc as string),
    value
  ) as string;
}

const completeDecimal = (value: string, bits: number): string => {
  const length = value.length;

  return length > bits ? value.slice(0, bits) : value;
};
