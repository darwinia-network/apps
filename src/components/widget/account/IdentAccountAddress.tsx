import Identicon from '@polkadot/react-identicon';
import { IAccountMeta } from '../../../model';
import { EllipsisMiddle } from '../EllipsisMiddle';
import { useAccountName } from '../../../hooks';

interface IdentAccountProps {
  account: IAccountMeta | undefined;
  className?: string;
  iconSize?: number;
}

const defaultSize = 32;

export function IdentAccountAddress({ account, className = '', iconSize = defaultSize }: IdentAccountProps) {
  const { name } = useAccountName(account?.address || '', account?.meta.name);

  if (!account) {
    return null;
  }
  const { address } = account;

  return (
    <div className={`flex items-center ${className}`}>
      <Identicon size={iconSize} value={address} className="rounded-full border border-gray-100" />
      {name && <span className="ml-2">{name}</span>}
      <span className="mx-1">-</span>
      <EllipsisMiddle className="lg:w-full w-1/2 dark:text-gray-700" value={address} />
    </div>
  );
}
