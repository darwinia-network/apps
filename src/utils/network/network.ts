import { ApiPromise } from '@polkadot/api';
import { omit, once, pick } from 'lodash';
import Web3 from 'web3';
import { SYSTEM_NETWORK_CONFIGURATIONS } from '../../config';
import { ChainConfig, MetamaskNativeNetworkIds, Network, AddEthereumChainParameter } from '../../model';
import { getCustomNetworkConfig } from '../helper';

export const NETWORK_CONFIGURATIONS = SYSTEM_NETWORK_CONFIGURATIONS.map((item) => {
  const customConfigs = getCustomNetworkConfig();

  return customConfigs[item.name] ? { ...item, ...pick(customConfigs[item.name], Object.keys(item)) } : item;
});

export const AIRPORT_NETWORKS: ChainConfig[] = NETWORK_CONFIGURATIONS.filter((item) =>
  ['ethereum', 'crab', 'tron'].includes(item.name)
).map((item) => omit(item, 'evm'));

export const getNetworkByRpc = (rpc: string | null | undefined): ChainConfig | null => {
  if (rpc) {
    return NETWORK_CONFIGURATIONS.find((item) => item.provider.rpc === decodeURIComponent(rpc)) ?? null;
  }

  console.warn('🚀 Can not find target network config by rpc: ', rpc);

  return null;
};

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

export function isNativeMetamaskChain(network: AddEthereumChainParameter): boolean {
  const ids = [
    MetamaskNativeNetworkIds.ethereum,
    MetamaskNativeNetworkIds.ropsten,
    MetamaskNativeNetworkIds.rinkeby,
    MetamaskNativeNetworkIds.goerli,
    MetamaskNativeNetworkIds.kovan,
  ];

  return ids.includes(+network.chainId);
}

export async function isNetworkConsistent(network: AddEthereumChainParameter, id = ''): Promise<boolean> {
  id = id && Web3.utils.isHex(id) ? parseInt(id, 16).toString() : id;
  // id 1: eth mainnet 3: ropsten 4: rinkeby 5: goerli 42: kovan  43: pangolin 44: crab
  const actualId: string = id ? await Promise.resolve(id) : await window.ethereum.request({ method: 'net_version' });
  const storedId = network.chainId;

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
