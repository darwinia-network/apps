import { useMemo } from 'react';
import { useApi } from './api';

export const useNetworkColor = () => {
  const { network } = useApi();

  const color = useMemo(
    () =>
      network.name === 'darwinia'
        ? 'text-darwinia-main'
        : network.name === 'crab'
        ? 'text-crab-main'
        : network.name === 'pangolin'
        ? 'text-pangolin-main'
        : network.name === 'pangoro'
        ? 'text-pangoro-main'
        : '',
    [network.name]
  );

  return { color };
};
