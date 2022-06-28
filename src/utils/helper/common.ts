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
  { decimal, ignoreZeroDecimal }: PrettyNumberOptions = { decimal: 3, ignoreZeroDecimal: true }
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

// eslint-disable-next-line complexity
export const checkBrower = () => {
  const userAgent = window.navigator.userAgent;

  // The order matters here, and this may report false positives for unlisted browsers.
  if (userAgent.indexOf('Firefox') > -1) {
    return 'Mozilla Firefox';
    // 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0'
  } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
    return 'Opera';
    // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 OPR/57.0.3098.106'
  } else if (userAgent.indexOf('Trident') > -1) {
    return 'Microsoft Internet Explorer';
    // 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; Zoom 3.6.0; wbx 1.0.0; rv:11.0) like Gecko'
  } else if (userAgent.indexOf('Edge') > -1) {
    return 'Microsoft Edge';
    // 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299'
  } else if (userAgent.indexOf('Chrome') > -1) {
    return 'Google Chrome or Chromium';
    // 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/66.0.3359.181 Chrome/66.0.3359.181 Safari/537.36'
  } else if (userAgent.indexOf('Safari') > -1) {
    return 'Apple Safari';
    // 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1 980x1306'
  } else {
    return 'Unknown';
  }
};

export const processTime = (start: number, expire: number): number => {
  const now = getUnixTime(new Date());
  const end = getUnixTime(expire);

  return end <= now ? 100 : 100 - ((end - now) / (end - getUnixTime(start))) * 100;
};
