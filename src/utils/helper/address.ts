import { TypeRegistry } from '@polkadot/types';
import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';
import type { Codec, DetectCodec } from '@polkadot/types/types';
import { keyring } from '@polkadot/ui-keyring';
import type { KeyringItemType, KeyringJson$Meta } from '@polkadot/ui-keyring/types';
import { hexToU8a, numberToU8a, stringToU8a, u8aToHex, isHex } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';
import { isNull } from 'lodash';
import { isAddress as isEthAddress } from 'web3-utils';

export const registry = new TypeRegistry();

export function evmAddressToAccountId(address: string | null | undefined): DetectCodec<Codec, string> {
  if (!address) {
    return registry.createType('AccountId', '');
  }

  // eslint-disable-next-line no-magic-numbers
  const data = new Uint8Array(32);

  data.set(stringToU8a('dvm:'));
  // eslint-disable-next-line no-magic-numbers
  data.set(hexToU8a(address), 11);
  // eslint-disable-next-line no-bitwise
  const checksum = data.reduce((pre: number, current: number): number => pre ^ current);

  // eslint-disable-next-line no-magic-numbers
  data.set(numberToU8a(checksum), 31);
  const accountId = registry.createType('AccountId', data);

  return accountId;
}

export function convertToSS58(text: string, prefix: number | null, isShort = false): string {
  if (!text || isNull(prefix)) {
    return '';
  }

  try {
    let address = encodeAddress(text, prefix);

    if (isShort) {
      address = toShortAddress(address);
    }

    return address;
  } catch (error) {
    return '';
  }
}

export function convertToEvm(address: string): string {
  if (!address) {
    return '';
  }

  return u8aToHex(decodeAddress(address));
}

export function canConvertToEth(address: string): boolean {
  return !!convertToEth(address);
}

export function convertToEth(address: string): string | null {
  if (!address) {
    return '';
  }

  const startAt = 2;
  const result = u8aToHex(decodeAddress(address)).slice(startAt);
  const PREFIX = '64766d3a00000000000000';

  // eslint-disable-next-line no-magic-numbers
  return result.startsWith(PREFIX) ? '0x' + result.slice(-42, -2) : null;
}

export function remove0x(text: string): string {
  const start = 2;

  if (text.slice(0, start) === '0x') {
    return text.slice(start);
  }
  return text;
}

export function getAddressMeta(address: string, type: KeyringItemType | null = null): KeyringJson$Meta {
  let meta: KeyringJson$Meta | undefined;

  try {
    const pair = keyring.getAddress(address, type);

    meta = pair && pair.meta;
  } catch (error) {
    // we could pass invalid addresses, so it may throw
  }

  return meta || {};
}

export function toShortAddress(_address?: AccountId | AccountIndex | Address | string | null | Uint8Array): string {
  const address = (_address || '').toString();

  // eslint-disable-next-line no-magic-numbers
  return address.length > 13 ? `${address.slice(0, 6)}…${address.slice(-6)}` : address;
}

// isName, isDefault, name
export function getAddressName(
  address: string,
  type: KeyringItemType | null = null,
  defaultName?: string
): [boolean, boolean, string] {
  const meta = getAddressMeta(address, type);

  return meta.name
    ? [false, false, meta.name.toUpperCase()]
    : defaultName
    ? [false, true, defaultName.toUpperCase()]
    : [true, false, toShortAddress(address)];
}

export const isValidAddress = (address: string) => {
  try {
    encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address));

    return true;
  } catch (error) {
    return false;
  }
};

export const isValidEthAddress = (address: string) => {
  return isEthAddress(address);
};
