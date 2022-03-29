import { Network, DarwiniaAsset } from '../model';

export const NETWORKS_TOKENS: {
  [networkKey in Network]?: {
    [tokenKey in DarwiniaAsset]: string;
  };
} = {
  crab: {
    ring: 'CRAB',
    kton: 'CKTON',
  },
  darwinia: {
    ring: 'RING',
    kton: 'KTON',
  },
  pangolin: {
    ring: 'PRING',
    kton: 'PKTON',
  },
  pangoro: {
    ring: 'ORING',
    kton: 'OKTON',
  },
};

/* eslint-disable no-magic-numbers */
export const LONG_DURATION = 10 * 1000;

export const MIDDLE_DURATION = 6 * 1000;

export const SHORT_DURATION = 3 * 1000;

export const DATE_FORMAT = 'yyyy/MM/dd';

export const DATE_TIME_FORMATE = 'yyyy/MM/dd HH:mm:ss';
