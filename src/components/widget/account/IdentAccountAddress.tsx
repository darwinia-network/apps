import Identicon from '@polkadot/react-identicon';
import { Account } from '../../../model';
import { EllipsisMiddle } from '../EllipsisMiddle';
import { AccountName } from '../../../components/widget/account/AccountName';

interface IdentAccountProps {
  account: Account | undefined;
  className?: string;
  iconSize?: number;
}

const defaultSize = 32;

export function IdentAccountAddress({ account, className = '', iconSize = defaultSize }: IdentAccountProps) {
  if (!account) {
    return null;
  }
  const { displayAddress } = account;

  return (
    <div className={`flex items-center ${className}`}>
      <Identicon size={iconSize} value={displayAddress} className="rounded-full border border-gray-100 mr-1" />
      <AccountName account={displayAddress} />
      <span className="mx-1">-</span>
      <EllipsisMiddle className="lg:w-full w-1/2 dark:text-gray-700" value={displayAddress} />
    </div>
  );
}
