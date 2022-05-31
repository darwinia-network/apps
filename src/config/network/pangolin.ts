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
      symbol: 'WPRING',
      decimals: 18,
    },
  },
  ethereumChain: {
    blockExplorerUrls: ['https://pangolin.subscan.io/'],
    chainId: '43',
    chainName: 'pangolin',
    nativeCurrency: {
      decimals: 18,
      symbol: 'PRING',
    },
    rpcUrls: ['https://pangolin-rpc.darwinia.network/'],
  },
  endpoints: {
    mmr: 'https://api.subquery.network/sq/darwinia-network/pangolin-mmr',
  },
  facade: {
    logo: '/image/pangolin.png',
    logoMinor: '/image/pangolin.svg',
    logoWithText: '/image/pangolin-logo.svg',
  },
  isTest: true,
  name: 'pangolin',
  provider: {
    etherscan: 'wss://ropsten.infura.io/ws/v3/5350449ccd2349afa007061e62ee1409',
    rpc: 'wss://pangolin-rpc.darwinia.network',
  },
  ss58Prefix: 42,
  type: ['polkadot', 'darwinia'],
  tokens: {
    ring: { decimal: '9', symbol: 'PRING' },
    kton: { decimal: '9', symbol: 'PKTON' },
  },
};
