import type { VercelRequest, VercelResponse } from '@vercel/node';
import { BN } from '@polkadot/util';
import { Keyring } from '@polkadot/keyring';
import type { u16 } from '@polkadot/types';
import type { RuntimeVersion, AccountInfo } from '@polkadot/types/interfaces';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { millisecondsInHour } from 'date-fns';
import qs from 'qs';

import { isValidAddressPolkadotAddress, responseEnd } from './utils';
import { ResponseCode, ThrottleData, TransferData, Config } from './types';
import { redis } from './redis';

// eslint-disable-next-line complexity
export async function handler(req: VercelRequest, res: VercelResponse, config: Config) {
  res.setHeader('content-type', 'application/json');

  try {
    const { client, error } = redis();
    if (!client || error) {
      return responseEnd<null>(res, {
        code: ResponseCode.FAILED_OTHER,
        message: error?.message || 'Failed to connect redis',
        data: null,
      });
    }

    const ip = req.headers['x-forwarded-for']?.toString();
    if (!ip) {
      return responseEnd<null>(res, {
        code: ResponseCode.FAILED_OTHER,
        message: 'Failed to get ip address',
        data: null,
      });
    }

    const provider = new WsProvider(config.endpoint);
    const api = await ApiPromise.create({ provider });

    const { specName } = api.consts.system.version as RuntimeVersion;
    const ipKey = `${specName.toString().toLowerCase()}-${ip}`;

    const ipRecord = await client.get(ipKey);
    if (ipRecord) {
      const lastTime = Number(ipRecord);

      if (Date.now() - lastTime <= config.throttleHours * millisecondsInHour) {
        return responseEnd<ThrottleData>(res, {
          code: ResponseCode.FAILED_THROTTLE,
          message: `You can get it every ${config.throttleHours} hours`,
          data: { lastTime },
        });
      }
    }

    const transferTo = qs.parse(req.body).address as string;
    if (!isValidAddressPolkadotAddress(transferTo)) {
      return responseEnd<null>(res, {
        code: ResponseCode.FAILED_PARAMS,
        message: 'Invalid address parameter',
        data: null,
      });
    }

    if (!config.seed) {
      return responseEnd<null>(res, {
        code: ResponseCode.FAILED_OTHER,
        message: 'Failed to get faucet pool',
        data: null,
      });
    }

    const ss58Prefix = api.consts.system.ss58Prefix as u16;
    const keyring = new Keyring({ type: 'sr25519', ss58Format: ss58Prefix.toNumber() });

    const faucetAccount = keyring.addFromUri(config.seed);
    const transferMount = new BN(config.transferMount);

    const {
      data: { free },
    } = (await api.query.system.account(faucetAccount.address)) as AccountInfo;
    if (free.lte(transferMount)) {
      return responseEnd<null>(res, {
        code: ResponseCode.FAILED_INSUFFICIENT,
        message: 'Faucet pool is insufficient',
        data: null,
      });
    }

    console.log(
      `[${specName.toString()}] transfer ${transferMount.toString()} to ${transferTo} from ${faucetAccount.address}`
    );

    await api.tx.balances.transfer(transferTo, transferMount).signAndSend(faucetAccount, (result) => {
      const txHash = result.txHash.toHex();

      if (result.status.isFinalized || result.status.isInBlock) {
        result.events
          .filter(({ event: { section } }) => section === 'system')
          .forEach(({ event: { method } }): void => {
            if (method === 'ExtrinsicFailed') {
              return responseEnd<TransferData>(res, {
                code: ResponseCode.FAILED_EXTRINSIC,
                message: 'Extrinsic failed',
                data: { txHash },
              });
            } else if (method === 'ExtrinsicSuccess') {
              client.set(ipKey, Date.now());
              return responseEnd<TransferData>(res, {
                code: ResponseCode.SUCCESS,
                message: 'Success',
                data: { txHash },
              });
            }
          });
      } else if (result.isError) {
        return responseEnd<TransferData>(res, {
          code: ResponseCode.FAILED_EXTRINSIC,
          message: 'Extrinsic error',
          data: { txHash },
        });
      }
    });
  } catch (err) {
    const error = err as Error;

    return responseEnd<null>(res, {
      code: ResponseCode.FAILED_OTHER,
      message: error.message,
      data: null,
    });
  }
}
