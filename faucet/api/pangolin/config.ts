import type { Config } from '../types';

/* eslint-disable no-magic-numbers */
export const config: Config = {
  seed: process.env.PANGOLIN_SEED,
  endpoint: 'wss://pangolin-rpc.darwinia.network',
  throttleHours: 12, // 12 hours
  transferMount: 100000000000, // 100 RING
};
