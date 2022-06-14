import { Wallet } from '../model';

const injecteds = window.injectedWeb3;

export const supportedWallets: Wallet[] = [
  {
    ...(injecteds['polkadot-js'] ?? []),
    extensionName: 'polkadot-js',
    title: 'Polkadot{.js}',
    installUrl: 'https://polkadot.js.org/extension/',
    installed: !!injecteds['polkadot-js'],
    logo: {
      src: '/image/wallet/polkadot-js.svg',
      alt: 'Polkadotjs Logo',
    },
  },
  {
    ...(injecteds['talisman'] ?? {}),
    extensionName: 'talisman',
    title: 'Talisman',
    installUrl: 'https://chrome.google.com/webstore/detail/talisman-wallet/fijngjgcjhjmmpcmkeiomlglpeiijkld',
    installed: !!injecteds['talisman'],
    logo: {
      src: '/image/wallet/talisman.svg',
      alt: 'Talisman Logo',
    },
  },
  // {
  //   ...(injecteds['subwallet-js'] ?? {}),
  //   extensionName: 'subwallet-js',
  //   title: 'SubWallet',
  //   installUrl: 'https://subwallet.app/download.html',
  //   installed: !!injecteds['subwallet-js'],
  //   logo: {
  //     src: '/image/wallet/subwallet-js.svg',
  //     alt: 'Subwallet Logo',
  //   },
  // },
];
