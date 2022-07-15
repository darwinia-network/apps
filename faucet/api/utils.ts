import { BN, hexToU8a, isHex } from '@polkadot/util';
import type { u16 } from '@polkadot/types';
import type { RuntimeVersion, AccountInfo } from '@polkadot/types/interfaces';
import { ApiPromise } from '@polkadot/api';
import { Keyring, decodeAddress, encodeAddress } from '@polkadot/keyring';
import type { VercelResponse } from '@vercel/node';

import { ResponseBody, ResponseCode, TransferData } from './types';

export const transfer = async (
  api: ApiPromise,
  seed: string,
  address: string,
  amount: BN
): Promise<{ body: ResponseBody<TransferData | null>; error: Error | null }> => {
  const { specName } = api.consts.system.version as RuntimeVersion;

  try {
    const ss58Prefix = api.consts.system.ss58Prefix as u16;
    const keyring = new Keyring({ type: 'sr25519', ss58Format: ss58Prefix.toNumber() });
    const faucetAccount = keyring.addFromUri(seed);

    console.log(`[${specName.toString()}] transfer ${amount.toString()} to ${address} from ${faucetAccount.address}`);

    const {
      data: { free },
    } = (await api.query.system.account(faucetAccount.address)) as AccountInfo;
    if (free.lte(amount)) {
      return {
        body: {
          code: ResponseCode.FAILED_INSUFFICIENT,
          message: 'Faucet pool is insufficient',
          data: null,
        },
        error: null,
      };
    }

    const txHash = (await api.tx.balances.transfer(address, amount).signAndSend(faucetAccount)).toHex();
    return {
      body: {
        code: ResponseCode.SUCCESS,
        message: 'Success',
        data: { txHash },
      },
      error: null,
    };
  } catch (err) {
    const error = err as Error;
    console.error(`[${specName.toString()}] Failed to transfer to ${address}: ${error.message}`);

    return {
      body: {
        code: ResponseCode.FAILED_OTHER,
        message: error.message,
        data: null,
      },
      error,
    };
  }
};

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
  statusCode: number,
  body: ResponseBody<ResponseData>
) => {
  res.statusCode = statusCode;
  return res.end(JSON.stringify(body, null, 2)); // eslint-disable-line no-magic-numbers
};
