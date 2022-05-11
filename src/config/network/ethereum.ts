import { AddEthereumChainParameter } from '../../model/metamask';

export const ethereumConfig: AddEthereumChainParameter = {
  blockExplorerUrls: ['https://etherscan.io/'],
  chainId: '1',
  chainName: 'Ethereum Mainnet',
  nativeCurrency: {
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://mainnet.infura.io/v3/'],
};
