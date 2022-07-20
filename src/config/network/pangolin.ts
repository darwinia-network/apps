import { DVMChainConfig } from '../../model';

export const pangolinConfig: DVMChainConfig = {
  dvm: {
    kton: {
      address: '0x8809f9b3ACEF1dA309f49b5Ab97A4C0faA64E6Ae',
      symbol: 'WPKTON',
      decimals: 18,
    },
    ring: {
      address: '0xc52287b259b2431ba0f61BC7EBD0eD793B0b7044',
      symbol: 'PRING',
      decimals: 18,
    },
  },
  ethereumChain: {
    blockExplorerUrls: ['https://pangolin.subscan.io/'],
    chainId: '43',
    chainName: 'Pangolin Smart Chain',
    nativeCurrency: {
      decimals: 18,
      symbol: 'PRING',
    },
    rpcUrls: ['https://pangolin-rpc.darwinia.network/'],
  },
  facade: {
    logo: '/image/network/pangolin.svg',
  },
  category: 'test',
  name: 'pangolin',
  provider: {
    rpc: 'wss://pangolin-rpc.darwinia.network',
  },
  ss58Prefix: 42,
  type: ['polkadot', 'darwinia'],
  tokens: {
    ring: { decimal: '9', symbol: 'PRING' },
    kton: { decimal: '9', symbol: 'PKTON' },
  },
  subquery: {
    endpoint: 'https://api.subquery.network/sq/darwinia-network/apps-pangolin',
  },
};
