import { DVMChainConfig } from '../../model';

export const crabConfig: DVMChainConfig = {
  dvm: {
    kton: {
      address: '0x159933C635570D5042723359fbD1619dFe83D3f3',
      symbol: 'WCKTON',
      decimals: 18,
    },
    ring: {
      address: '0x2d2b97ea380b0185e9fdf8271d1afb5d2bf18329',
      symbol: 'CRAB',
      decimals: 18,
    },
  },
  ethereumChain: {
    blockExplorerUrls: ['https://crab.subscan.io/'],
    chainId: '44',
    chainName: 'crab',
    nativeCurrency: {
      decimals: 18,
      symbol: 'CRAB',
    },
    rpcUrls: ['https://crab-rpc.darwinia.network/'],
  },
  facade: {
    logo: '/image/crab.svg',
  },
  category: 'live',
  name: 'crab',
  provider: {
    rpc: 'wss://crab-rpc.darwinia.network',
  },
  type: ['polkadot', 'darwinia'],
  ss58Prefix: 42,
  tokens: {
    ring: { decimal: '9', symbol: 'CRAB' },
    kton: { decimal: '9', symbol: 'CKTON' },
  },
  subquery: {
    endpoint: 'https://api.subquery.network/sq/darwinia-network/apps-crab',
  },
};
