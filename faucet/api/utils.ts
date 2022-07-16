import { hexToU8a, isHex } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import type { VercelResponse } from '@vercel/node';

import { ResponseBody } from './types';

export const isValidAddressPolkadotAddress = (address?: string) => {
  try {
    encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address));

    return true;
  } catch (error) {
    return false;
  }
};

export const responseEnd = <ResponseData = null>(
  res: VercelResponse,
  body: ResponseBody<ResponseData>,
  statusCode = 200 // eslint-disable-line no-magic-numbers
) => {
  res.statusCode = statusCode;
  return res.end(JSON.stringify(body, null, 2)); // eslint-disable-line no-magic-numbers
};
