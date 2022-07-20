import { DVMChainConfig } from '../../model';

export const darwiniaConfig: DVMChainConfig = {
  dvm: {
    ring: {
      address: '',
      symbol: 'RING',
      decimals: 18,
    },
  },
  ethereumChain: {
    blockExplorerUrls: ['https://darwinia.subscan.io/'],
    chainId: '46',
    chainName: 'darwinia',
    nativeCurrency: {
      decimals: 18,
      symbol: 'RING',
    },
    rpcUrls: ['https://darwinia-rpc.darwinia.network/'],
  },
  facade: {
    logo: '/image/network/darwinia.svg',
  },
  category: 'live',
  name: 'darwinia',
  provider: {
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
