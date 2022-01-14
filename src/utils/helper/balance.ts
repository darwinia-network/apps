import BN from 'bn.js';

export type WeiValue = string | BN | number | null | undefined;
export interface PrettyNumberOptions {
  withThousandSplit?: boolean;
  decimal?: number;
}

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

const completeDecimal = (value: string, bits: number): string => {
  const length = value.length;

  return length > bits ? value.slice(0, bits) : value;
};
