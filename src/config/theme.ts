import { NetworkThemeConfig } from '../model';
import dark from '../theme/antd/dark.json';
import light from '../theme/antd/light.json';
import vars from '../theme/antd/vars.json';
import crab from '../theme/network/crab.json';
import crabDark from '../theme/network/dark/crab.json';
import darwiniaDark from '../theme/network/dark/darwinia.json';
import pangolinDark from '../theme/network/dark/pangolin.json';
import pangoroDark from '../theme/network/dark/pangoro.json';
import darwinia from '../theme/network/darwinia.json';
import pangolin from '../theme/network/pangolin.json';
import pangoro from '../theme/network/pangoro.json';

const NETWORK_LIGHT_THEME: NetworkThemeConfig<{ [key in keyof typeof darwinia]: string }> = {
  crab,
  darwinia,
  pangolin,
  pangoro,
  'crab-parachain': crab,
  'pangolin-parachain': pangolin,
  ethereum: pangolin,
  ropsten: pangolin,
  tron: pangolin,
};

export const SKIN_THEME = {
  dark,
  light,
  vars,
};

const NETWORK_DARK_THEME: NetworkThemeConfig<{ [key in keyof typeof darwiniaDark]: string }> = {
  crab: crabDark,
  darwinia: darwiniaDark,
  pangolin: pangolinDark,
  pangoro: pangoroDark,
  'crab-parachain': crabDark,
  'pangolin-parachain': pangolinDark,
  ethereum: pangolinDark,
  ropsten: pangolinDark,
  tron: pangolinDark,
};

export enum THEME {
  LIGHT = 'light',
  DARK = 'dark',
}

export const NETWORK_THEME = { [THEME.LIGHT]: NETWORK_LIGHT_THEME, [THEME.DARK]: NETWORK_DARK_THEME };
