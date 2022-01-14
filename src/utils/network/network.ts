import { ApiPromise } from '@polkadot/api';
import { omit, once, pick } from 'lodash';
import { SYSTEM_NETWORK_CONFIGURATIONS } from '../../config';
import { ChainConfig, Network } from '../../model';
import { getCustomNetworkConfig } from '../helper';

export const NETWORK_CONFIGURATIONS = SYSTEM_NETWORK_CONFIGURATIONS.map((item) => {
  const customConfigs = getCustomNetworkConfig();

  return customConfigs[item.name] ? { ...item, ...pick(customConfigs[item.name], Object.keys(item)) } : item;
});

export const AIRPORT_NETWORKS: ChainConfig[] = NETWORK_CONFIGURATIONS.filter((item) =>
  ['ethereum', 'crab', 'tron'].includes(item.name)
).map((item) => omit(item, 'dvm'));

export function getNetworkByName(name: Network | null | undefined): ChainConfig | null {
  if (name) {
    return NETWORK_CONFIGURATIONS.find((item) => item.name === name) ?? null;
  }

  console.warn('🚀 Can not find target network config by name: ', name);

  return null;
}

export async function waitUntilConnected(api: ApiPromise): Promise<null> {
  await api.isReady;

  return new Promise((resolve) => {
    if (!api.isConnected) {
      api.on(
        'connected',
        once(() => resolve(null))
      );
    } else {
      resolve(null);
    }
  });
}
