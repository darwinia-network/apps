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
    chainName: 'pangoro',
    nativeCurrency: {
      decimals: 18,
      symbol: 'ORING',
    },
    rpcUrls: ['https://pangoro-rpc.darwinia.network/'],
  },
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
};
