import type { InjectedAccountWithMeta, InjectedWindowProvider, Injected } from '@polkadot/extension-inject/types';
import type { KeyringJson } from '@polkadot/ui-keyring/types';

export type WalletSource =
  | 'polkadot-js'
  | '"polkadot-js"'
  | 'talisman'
  | '"talisman"'
  | 'subwallet-js'
  | '"subwallet-js"';

interface WalletLogoProps {
  src: string;
  alt: string;
}

export interface Wallet extends Injected {
  title: string;
  logo: WalletLogoProps;
  extensionName: WalletSource;

  getProvider: () => InjectedWindowProvider | undefined;
  getInstallUrl: () => string;
}

export interface Account extends InjectedAccountWithMeta {
  displayAddress: string; // ss58 format
  json?: KeyringJson;
}
