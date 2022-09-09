import { DVMChainConfig } from '../../model';

export const pangoroConfig: DVMChainConfig = {
  dvm: {
    ring: {
      address: '',
      symbol: 'ORING',
      decimals: 18,
    },
  },
  ethereumChain: {
    blockExplorerUrls: ['https://pangoro.subscan.io/'],
    chainId: '45',
    chainName: 'Pangoro Smart Chain',
    nativeCurrency: {
      decimals: 18,
      symbol: 'ORING',
    },
    rpcUrls: ['https://pangoro-rpc.darwinia.network/'],
  },
  facade: {
    logo: '/image/network/pangoro.svg',
  },
  category: 'test',
  name: 'pangoro',
  provider: {
    rpc: 'wss://pangoro-rpc.darwinia.network',
  },
  ss58Prefix: 18,
  type: ['polkadot', 'darwinia'],
  tokens: {
    ring: { decimal: '9', symbol: 'ORING' },
    kton: { decimal: '9', symbol: 'OKTON' },
  },
  subquery: {
    endpoint: 'https://subql.darwinia.network/subql-apps-pangoro/',
  },
};
