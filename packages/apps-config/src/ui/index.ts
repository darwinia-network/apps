// Copyright 2017-2020 @polkadot/apps-config authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { chainColors, nodeColors, logoBgColors } from './general';
import { identityNodes } from './identityIcons';

function sanitize (value?: string): string {
  return value?.toLowerCase().replace('-', ' ') || '';
}

export function getSystemIcon (systemName: string): 'beachball' | 'polkadot' | 'substrate' {
  return (identityNodes[systemName.toLowerCase().replace(/-/g, ' ')] || 'substrate') as 'substrate';
}

export const getSystemChainColor = (systemChain: string, systemName: string): string | undefined => {
  return chainColors[sanitize(systemChain)] || nodeColors[sanitize(systemName)];
};

export const getSystemChainLogoBgColor = (systemChain: string, logo: undefined | string): string | undefined => {
  return logoBgColors[sanitize(logo)] || logoBgColors[sanitize(systemChain)];
};
