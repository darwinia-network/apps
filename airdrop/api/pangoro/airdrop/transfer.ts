import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { typesBundleForPolkadotApps } from '@darwinia/types/mix';
import { FrameSystemAccountInfo } from '@polkadot/types/lookup';
import {} from '@polkadot/api-augment';
import { Keyring } from '@polkadot/keyring';
import { hexToU8a } from '@polkadot/util';
import { Octokit } from '@octokit/rest';
import * as qs from 'qs';

const { is } = require('is_js');
const Redis = require('ioredis');

const AMOUNT = 100;

// request
export default async function (req: VercelRequest, res: VercelResponse) {
  const ip = req.headers['x-forwarded-for']?.toString();
  if (!ip) {
    res.statusCode = 403;
    const body = {
      err: 1,
      message: `Sorry, we can't find your ip address.`,
    };
    res.end(JSON.stringify(body, null, 2));
    return;
  }
  // const

  const data = qs.parse(req.body);

  res.setHeader('content-type', 'application/json');

  // check data
  if (!data || typeof data.address != 'string') {
    res.statusCode = 403;
    const body = {
      err: 1,
      message: 'Not have data',
    };
    res.end(JSON.stringify(body, null, 2));
    return;
  }

  // check address
  if (is.not.truthy(data.address)) {
    res.statusCode = 403;
    const body = {
      err: 1,
      message: 'No address found, please type receiver address',
    };
    res.end(JSON.stringify(body, null, 2));
    return;
  }

  let client;
  try {
    client = redis();
  } catch (e) {
    res.statusCode = 501;
    const body = {
      err: 1,
      message: 'Connection Redis failed',
      data: {
        state: '',
      },
    };
    res.end(JSON.stringify(body, null, 2));
    return;
  }

  // query github account info
  let user;
  try {
    const cookies = req.cookies;
    const accessToken = cookies['x-access-token'];
    const octokit = new Octokit({
      auth: accessToken,
    });
    const { data } = await octokit.request('/user');
    user = data;
  } catch (e) {
    res.statusCode = 401;
    const body = {
      err: 1,
      message: 'Authorization failed. please try login again',
      data: {
        state: 'NO_LOGIN',
      },
    };
    res.end(JSON.stringify(body, null, 2));
    return;
  }

  const chainName = 'PANGORO';
  const cacheKeyLastClaimedTime = `${chainName}-${user.id}-${ip}`;
  const lastClaimTime = await client.get(cacheKeyLastClaimedTime);
  if (lastClaimTime) {
    const now = +new Date();
    if (now - lastClaimTime <= 1000 * 60 * 60 * 12) {
      res.statusCode = 403;
      const body = {
        err: 1,
        message: 'Please wait for the restriction to be lifted',
        data: {
          state: 'RATE_LIMIT_IP',
          time: lastClaimTime,
        },
      };
      res.end(JSON.stringify(body, null, 2));
      return;
    }
  }

  try {
    // transfer
    const result = await transfer(chainName, data.address);
    if (result == null) {
      res.statusCode = 403;
      const body = {
        err: 1,
        message: 'Transfer failed. please connect team',
      };
      res.end(JSON.stringify(body, null, 2));
      return;
    }
    if (result instanceof String || typeof result == 'string') {
      res.statusCode = 403;
      const body = {
        err: 1,
        message: result,
      };
      res.end(JSON.stringify(body, null, 2));
      return;
    }

    // put sent time for user
    const now = +new Date();
    const cacheKeyClaimed = `${chainName}-${user.id}-${ip}`;
    await client.set(cacheKeyClaimed, now);
    // await client.set(cacheKeyIp, now);

    res.statusCode = 200;
    const body = {
      err: 0,
      data: result,
    };
    res.end(JSON.stringify(body, null, 2));
  } catch (e) {
    res.statusCode = 403;
    const body = {
      err: 1,
      message: 'Transfer failed: ' + e.message,
    };
    res.end(JSON.stringify(body, null, 2));
  }
}

async function transfer(chainName: String, address: String): Promise<TransferReceipt | String | null> {
  chainName = chainName.toUpperCase();

  const chain = require('../config/chain.json').pangolin_smart;
  chain.seed = process.env.PANGOLIN_SEED;
  const wsProvider = new WsProvider(chain.endpoint);

  console.log(`Check account ${chain.address} balance`);

  try {
    const api = await ApiPromise.create({
      provider: wsProvider,
      typesBundle: typesBundleForPolkadotApps,
    });

    await api.isReady;

    const { data } = await api.query.system.account<FrameSystemAccountInfo>(chain.address);
    console.log(`free balance ${data.free} of address ${chain.address}`);
    if (data.free.toNumber() <= AMOUNT * 1000000000) {
      return 'All airdrops have ended';
    }

    console.log(`Transfer chain ${chainName} to ${address.toString()}`);

    const keyring = new Keyring({ type: 'sr25519' });
    const faucetAccount = keyring.addFromSeed(hexToU8a(chain.seed));

    const txHash = await api.tx.balances.transfer(address.toString(), AMOUNT * 1000000000).signAndSend(faucetAccount);

    return {
      tx: txHash.toString(),
      preview: `https://pangoro.subscan.io/extrinsic/${txHash}`,
    };
  } catch (err) {
    console.error(err);
    return 'Failed to sign transactions: ' + err.message;
  }
}

let _redis: any;

function redis() {
  if (_redis) return _redis;
  const config = require('../config/redis.json');
  config.url = process.env.REDIS_CONNECT_URL;
  _redis = new Redis(config.url);
  return _redis;
}

interface TransferReceipt {
  tx: String;
  preview: String;
}
