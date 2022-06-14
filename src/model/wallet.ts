import type { InjectedAccountWithMeta, InjectedExtension } from '@polkadot/extension-inject/types';
import type { KeyringJson } from '@polkadot/ui-keyring/types';

export type WalletSource = 'polkadot-js' | 'talisman' | 'subwallet-js';

interface WalletLogoProps {
  src: string;
  alt: string;
}

interface WalletData {
  installUrl: string;
  logo: WalletLogoProps;
  title: string;
}

export interface Wallet extends InjectedExtension, WalletData {
  installed: boolean | undefined;
  extensionName: WalletSource;

  enable: (name: string) => Wallet;
}

export interface Account extends InjectedAccountWithMeta {
  displayAddress: string; // ss58 format
  json?: KeyringJson;
}
