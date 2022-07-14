import { BN } from '@polkadot/util';
import type { RuntimeVersion, AccountInfo } from '@polkadot/types/interfaces';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';

import { ResponseBody, ResponseCode, TransferData } from './types';

export const transfer = async (
  endpoint: string,
  seed: string,
  address: string,
  amount: BN
): Promise<{ body: ResponseBody<TransferData | null>; error: Error | null }> => {
  try {
    const keyring = new Keyring({ type: 'sr25519' });
    const faucetAccount = keyring.addFromUri(seed);

    const provider = new WsProvider(endpoint);
    const api = await ApiPromise.create({ provider });

    const { specName } = api.consts.system.version as RuntimeVersion;
    console.log(`[${specName}] transfer ${amount.toString()} to ${address} from ${faucetAccount.address}`);

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
  } catch (error) {
    console.error(`[${endpoint}] Failed to transfer to ${address}: ${error.message}`);

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
