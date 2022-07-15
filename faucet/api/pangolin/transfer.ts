import type { VercelRequest, VercelResponse } from '@vercel/node';
import { BN } from '@polkadot/util';
import * as qs from 'qs';
import is from 'is_js';

import { transfer } from '../utils';
import { ResponseBody, ResponseCode, ThrottleData } from '../types';
import { redis } from './redis';
import { endpoint, seed } from './config/chain.json';

// eslint-disable-next-line no-magic-numbers
const THROTTLE_TIME = 1000 * 60 * 60 * 12; // 12 hours
const AMOUNT = 100 * 1000000000; // eslint-disable-line no-magic-numbers
const CHAIN_NAME = 'pangolin';
const THROTTLE_MESSAGE = 'You can get it every 12 hours';

const STRINGIFY_SPACE = 2; // eslint-disable-line no-magic-numbers

// eslint-disable-next-line complexity
export default async function (req: VercelRequest, res: VercelResponse) {
  res.setHeader('content-type', 'application/json');

  const { client, error } = redis();
  if (!client && error) {
    const body: ResponseBody<null> = {
      code: ResponseCode.FAILED_OTHER,
      message: error.message,
      data: null,
    };

    res.statusCode = 501;
    return res.end(JSON.stringify(body, null, STRINGIFY_SPACE));
  }

  const ip = req.headers['x-forwarded-for']?.toString();
  if (!ip) {
    const body: ResponseBody<null> = {
      code: ResponseCode.FAILED_OTHER,
      message: 'Failed to get ip address',
      data: null,
    };

    res.statusCode = 403;
    return res.end(JSON.stringify(body, null, STRINGIFY_SPACE));
  }

  const ipKey = `${CHAIN_NAME}-${ip}`;
  const ipRecord = await client.get(ipKey);
  if (ipRecord) {
    const now = +new Date();
    const lastClaimTime = +ipRecord;

    if (now - lastClaimTime <= THROTTLE_TIME) {
      const body: ResponseBody<ThrottleData> = {
        code: ResponseCode.FAILED_THROTTLE,
        message: THROTTLE_MESSAGE,
        data: { lastClaimTime },
      };

      res.statusCode = 429;
      return res.end(JSON.stringify(body, null, STRINGIFY_SPACE));
    }
  }

  const params = qs.parse(req.body);
  if (!params || is.not.truthy(params.address)) {
    const body: ResponseBody<null> = {
      code: ResponseCode.FAILED_PARAMS,
      message: 'Failed to get address param',
      data: null,
    };

    res.statusCode = 403;
    return res.end(JSON.stringify(body, null, STRINGIFY_SPACE));
  }

  try {
    const { body, error } = await transfer(endpoint, seed, params.address, new BN(AMOUNT));
    if (body.code === ResponseCode.SUCCESS) {
      await client.set(ipKey, +new Date());
    }

    res.statusCode = error ? 403 : 200; // eslint-disable-line no-magic-numbers
    return res.end(JSON.stringify(body, null, STRINGIFY_SPACE));
  } catch (error) {
    const body: ResponseBody<null> = {
      code: ResponseCode.FAILED_OTHER,
      message: error.message,
      data: null,
    };

    res.statusCode = 501;
    return res.end(JSON.stringify(body, null, STRINGIFY_SPACE));
  }
}
