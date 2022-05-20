import { BN } from '@polkadot/util';
import { EMPTY } from 'rxjs';
import { addDays, fromUnixTime, getUnixTime } from 'date-fns';

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export function empty(...args: any[]) {
  // nothing to do
}

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export function emptyObsFactory() {
  return EMPTY.subscribe();
}

export function truth(): true {
  return true;
}

const isDecimal = (value: number | string) => {
  return /\d+\.\d+/.test(String(value));
};

const completeDecimal = (value: string, bits: number): string => {
  const length = value.length;

  return length > bits ? value.slice(0, bits) : value;
};

export interface PrettyNumberOptions {
  decimal?: number;
  ignoreZeroDecimal?: boolean;
}

// eslint-disable-next-line complexity
export function prettyNumber(
  value: string | number | BN | null | undefined,
  { decimal, ignoreZeroDecimal }: PrettyNumberOptions = { decimal: 3, ignoreZeroDecimal: false }
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

  const result =
    +suffix !== 0
      ? `${prefix}.${suffix}`
      : ignoreZeroDecimal || !decimal
      ? prefix
      : `${prefix}.${'0'.padEnd(decimal!, '0')}`;

  return +result === 0 ? '0' : result;
}

export function getTimeRange(
  startTime: number,
  duration: number
): {
  start: Date;
  end: Date;
} {
  const base = 30;
  const start = fromUnixTime(startTime);
  const end = addDays(start, base * duration);

  return { start, end };
}

export function buf2hex(buffer: ArrayBuffer) {
  // eslint-disable-next-line no-magic-numbers
  return '0x' + Array.prototype.map.call(new Uint8Array(buffer), (x) => ('00' + x.toString(16)).slice(-2)).join('');
}

export const calcMonths = (startTime: string | number, expiredTime: string | number) => {
  const start = typeof startTime === 'number' ? startTime : Number(startTime);
  const expired = typeof expiredTime === 'number' ? expiredTime : Number(expiredTime);

  // eslint-disable-next-line no-magic-numbers
  return start >= expired ? 0 : (expired - start) / 1000 / 60 / 60 / 24 / 30;
};

export const processTime = (start: number, expire: number): number => {
  const now = getUnixTime(new Date());
  const end = getUnixTime(expire);

  return end <= now ? 100 : 100 - ((end - now) / (end - getUnixTime(start))) * 100;
};
