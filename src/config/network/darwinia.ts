import { PolkadotChainConfig } from '../../model';

export const darwiniaConfig: PolkadotChainConfig = {
  facade: {
    logo: '/image/darwinia.png',
    logoMinor: '/image/darwinia.svg',
    logoWithText: '/image/darwinia-logo.svg',
  },
  isTest: false,
  name: 'darwinia',
  provider: {
    etherscan: '',
    rpc: 'wss://rpc.darwinia.network',
  },
  ss58Prefix: 18,
  type: ['polkadot', 'darwinia'],
  tokens: {
    ring: { decimal: '9', symbol: 'RING' },
    kton: { decimal: '9', symbol: 'KTON' },
  },
  subquery: {
    endpoint: 'https://api.subquery.network/sq/darwinia-network/apps-darwinia',
  },
};
