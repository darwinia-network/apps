import { ApiPromise } from '@polkadot/api';
import { omit, once, pick } from 'lodash';
import Web3 from 'web3';
import { SYSTEM_NETWORK_CONFIGURATIONS } from '../../config';
import { ChainConfig, EthereumChainConfig, MetamaskNativeNetworkIds, Network } from '../../model';
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

export function isNativeMetamaskChain(network: Network): boolean {
  const ids = [
    MetamaskNativeNetworkIds.ethereum,
    MetamaskNativeNetworkIds.ropsten,
    MetamaskNativeNetworkIds.rinkeby,
    MetamaskNativeNetworkIds.goerli,
    MetamaskNativeNetworkIds.kovan,
  ];
  const chain = getNetworkByName(network) as EthereumChainConfig;

  return ids.includes(+chain.ethereumChain.chainId);
}

export async function isNetworkConsistent(network: Network, id = ''): Promise<boolean> {
  id = id && Web3.utils.isHex(id) ? parseInt(id, 16).toString() : id;
  // id 1: eth mainnet 3: ropsten 4: rinkeby 5: goerli 42: kovan  43: pangolin 44: crab
  const actualId: string = id ? await Promise.resolve(id) : await window.ethereum.request({ method: 'net_version' });
  const chain = getNetworkByName(network) as EthereumChainConfig;
  const storedId = chain.ethereumChain.chainId;

  return storedId === actualId;
}

export function isMetamaskInstalled(): boolean {
  return typeof window.ethereum !== 'undefined' || typeof window.web3 !== 'undefined';
}

export function findNetworkConfig(network: Network): ChainConfig {
  const target = NETWORK_CONFIGURATIONS.find((item) => item.name === network);

  if (!target) {
    throw new Error(`Can not find chain configuration by ${network}`);
  }

  return target;
}
