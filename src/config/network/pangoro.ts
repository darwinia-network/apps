import { EVMChainConfig } from '../../model';

export const pangoroConfig: EVMChainConfig = {
  evm: {
    kton: {
      address: '0x0000000000000000000000000000000000000402',
      symbol: 'OKTON',
      decimals: 18,
    },
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
