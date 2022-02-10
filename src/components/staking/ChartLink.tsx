import { LineChartOutlined } from '@ant-design/icons';
import { useMemo } from 'react';
import { useApi } from '../../hooks';
import { IconProps } from '../icons/icon-factory';

interface ChartLinkProps extends IconProps {
  account: string;
}

export function ChartLink({ account, className, ...rest }: ChartLinkProps) {
  const { network } = useApi();
  const url = useMemo(() => {
    const {
      provider: { rpc },
    } = network;
    const encodedRpc = encodeURIComponent(rpc);

    return `https://polkadot.js.org/apps/?rpc=${encodedRpc}#/staking/query/${account}`;
  }, [account, network]);

  return (
    <LineChartOutlined
      {...rest}
      className={`hover:text-${network.name}-main transform transition-colors duration-500 text-xl ${className}`}
      onClick={() => {
        window.open(url, '_blank');
      }}
    />
  );
}
