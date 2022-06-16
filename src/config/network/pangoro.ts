import { PolkadotChainConfig } from '../../model';

export const pangoroConfig: PolkadotChainConfig = {
  facade: {
    logo: '/image/pangoro.png',
    logoMinor: '/image/pangoro.png',
    logoWithText: '',
  },
  endpoints: {
    mmr: '',
  },
  isTest: true,
  name: 'pangoro',
  provider: {
    etherscan: '',
    rpc: 'wss://pangoro-rpc.darwinia.network',
  },
  ss58Prefix: 18,
  type: ['polkadot', 'darwinia'],
  tokens: {
    ring: { decimal: '9', symbol: 'ORING' },
    kton: { decimal: '9', symbol: 'OKTON' },
  },
  subquery: {
    endpoint: 'https://api.subquery.network/sq/darwinia-network/apps-pangoro',
  },
};
