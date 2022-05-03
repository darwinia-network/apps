import { BN } from '@polkadot/util';
import { isString, isNumber, isUndefined, isNull } from 'lodash';
import { Unit, fromWei as web3FromWei, toWei as web3ToWei, unitMap, Units } from 'web3-utils';

export type WeiValue = string | BN | number | null | undefined;

export const ETH_UNITS = unitMap as unknown as Units;

export function getUnit(num: number): Unit {
  const str = Math.pow(10, num).toString();
  try {
    const [key] = Object.entries(ETH_UNITS).find(([_, value]) => value === str) as [Unit, string];

    return key;
  } catch (err) {
    return 'ether';
  }
}

export function getPrecisionByUnit(unit: Unit): number {
  return ETH_UNITS[unit].length - 1;
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
