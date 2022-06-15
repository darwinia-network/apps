import type { Injected } from '@polkadot/extension-inject/types';
import type { Wallet } from '../model';
import { checkBrower } from '../utils';

export const supportedWallets: Omit<Wallet, keyof Injected>[] = [
  {
    title: 'Polkadot{.js}',
    extensionName: 'polkadot-js',
    logo: {
      src: '/image/wallet/polkadot-js.svg',
      alt: 'Polkadotjs Logo',
    },
    getProvider: () => {
      const injecteds = window.injectedWeb3;
      return injecteds && (injecteds['polkadot-js'] || injecteds['"polkadot-js"']);
    },
    getInstallUrl: () => {
      return 'https://polkadot.js.org/extension/';
    },
  },
  {
    title: 'Talisman',
    extensionName: 'talisman',
    logo: {
      src: '/image/wallet/talisman.svg',
      alt: 'Talisman Logo',
    },
    getProvider: () => {
      const injecteds = window.injectedWeb3;
      return injecteds && (injecteds['talisman'] || injecteds['"talisman"']);
    },
    getInstallUrl: () => {
      return checkBrower() === 'Google Chrome or Chromium'
        ? 'https://chrome.google.com/webstore/detail/talisman-wallet/fijngjgcjhjmmpcmkeiomlglpeiijkld'
        : 'https://addons.mozilla.org/en-US/firefox/addon/talisman-wallet-extension/';
    },
  },
  // {
  //   extensionName: 'subwallet-js',
  //   title: 'SubWallet',
  //   logo: {
  //     src: '/image/wallet/subwallet-js.svg',
  //     alt: 'Subwallet Logo',
  //   },
  //   getProvider: () => {
  //     const injecteds = window.injectedWeb3;
  //     return injecteds && (injecteds['subwallet-js'] || injecteds['"subwallet-js"']);
  //   },
  //   getInstallUrl: () => {
  //     return 'https://subwallet.app/download.html';
  //   },
  // },
];
