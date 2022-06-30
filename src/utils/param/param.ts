import { stringify } from '@polkadot/util';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toHumanJson(value: any): string {
  return stringify(value, 2) // eslint-disable-line no-magic-numbers
    .replace(/,\n/g, '\n')
    .replace(/"/g, '')
    .replace(/\\/g, '')
    .replace(/\],\[/g, '],\n[');
}
