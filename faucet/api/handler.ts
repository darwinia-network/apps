import type { VercelRequest, VercelResponse } from '@vercel/node';
import { BN } from '@polkadot/util';
import type { RuntimeVersion } from '@polkadot/types/interfaces';
import { ApiPromise, WsProvider } from '@polkadot/api';
import qs from 'qs';

import { transfer, isValidAddressPolkadotAddress, responseEnd } from './utils';
import { ResponseCode, ThrottleData, Config } from './types';
import { redis } from './redis';

/* eslint-disable no-magic-numbers */
const HOUR_TO_MILLISECONDS = 60 * 60 * 1000;

// eslint-disable-next-line complexity
export async function handler(req: VercelRequest, res: VercelResponse, config: Config) {
  res.setHeader('content-type', 'application/json');

  try {
    const { client, error } = redis();
    if (!client || error) {
      return responseEnd<null>(res, 501, {
        code: ResponseCode.FAILED_OTHER,
        message: error?.message || 'Failed to connect redis',
        data: null,
      });
    }

    const ip = req.headers['x-forwarded-for']?.toString();
    if (!ip) {
      return responseEnd<null>(res, 403, {
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
      const now = +new Date();
      const lastClaimTime = +ipRecord;

      if (now - lastClaimTime <= config.throttleHours * HOUR_TO_MILLISECONDS) {
        return responseEnd<ThrottleData>(res, 429, {
          code: ResponseCode.FAILED_THROTTLE,
          message: `You can get it every ${config.throttleHours} hours`,
          data: { lastClaimTime },
        });
      }
    }

    const address = qs.parse(req.body).address as string;
    if (!isValidAddressPolkadotAddress(address)) {
      return responseEnd<null>(res, 403, {
        code: ResponseCode.FAILED_PARAMS,
        message: 'Invalid address parameter',
        data: null,
      });
    }

    if (!config.seed) {
      return responseEnd<null>(res, 501, {
        code: ResponseCode.FAILED_OTHER,
        message: 'Failed to get faucet pool',
        data: null,
      });
    }

    const { body, error: transferError } = await transfer(api, config.seed, address, new BN(config.transferMount));
    if (body.code === ResponseCode.SUCCESS) {
      await client.set(ipKey, +new Date());
    }

    return responseEnd(res, transferError ? 403 : 200, body);
  } catch (err) {
    const error = err as Error;

    return responseEnd<null>(res, 501, {
      code: ResponseCode.FAILED_OTHER,
      message: error.message,
      data: null,
    });
  }
}
