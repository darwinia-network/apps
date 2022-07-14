import { Typography } from 'antd';
import { CSSProperties, PropsWithChildren, ReactNode } from 'react';
import { Network } from '../../model';

const { Link } = Typography;

interface SubscanLinkProps extends PropsWithChildren<unknown> {
  address?: string;
  block?: string;
  className?: string;
  copyable?: boolean;
  extrinsic?: { height: string | number; index: number | string };
  network: Network;
  style?: CSSProperties;
  txHash?: string;
  query?: string;
  prefix?: ReactNode;
}

// eslint-disable-next-line complexity
export function SubscanLink({
  network,
  address,
  extrinsic,
  children,
  copyable,
  block,
  txHash,
  query,
  prefix,
  ...other
}: SubscanLinkProps) {
  if (address) {
    return (
      <Link
        href={`https://${network}.subscan.io/account/${address}${query ? '?' + query : ''}`}
        target="_blank"
        copyable={copyable}
      >
        {children || address}
      </Link>
    );
  }

  if (extrinsic) {
    const { height, index } = extrinsic;

    return (
      <Link href={`https://${network}.subscan.io/extrinsic/${height}-${index}`} target="_blank" {...other}>
        {children || `${height}-${index}`}
      </Link>
    );
  }

  if (txHash) {
    return (
      <Link href={`https://${network}.subscan.io/extrinsic/${txHash}`} target="_blank" {...other}>
        {children || txHash}
      </Link>
    );
  }

  if (block) {
    return (
      <Link href={`https://${network}.subscan.io/block/${block}`} target="_blank" {...other}>
        {prefix}
        {children || block}
      </Link>
    );
  }

  return null;
}
