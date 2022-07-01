import { PolkadotChainConfig } from '../../model';

export const crabParachainConfig: PolkadotChainConfig = {
  facade: {
    logo: '/image/crab.png',
    logoMinor: '/image/crab.svg',
    logoWithText: '/image/crab-logo.svg',
  },
  isTest: false,
  isParachain: true,
  name: 'crab-parachain',
  provider: {
    rpc: 'wss://crab-parachain-rpc.darwinia.network/',
  },
  ss58Prefix: 42,
  type: ['polkadot', 'darwinia'],
  tokens: {
    ring: { decimal: '18', symbol: 'CRAB' },
    kton: { decimal: '18', symbol: 'CKTON' },
  },
};
