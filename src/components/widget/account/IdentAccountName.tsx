import Identicon from '@polkadot/react-identicon';
import { AccountName } from './AccountName';

interface IdentAccountProps {
  account: string;
  className?: string;
  iconSize?: number;
}

// eslint-disable-next-line no-magic-numbers
export function IdentAccountName({ account, iconSize = 32, className = '' }: IdentAccountProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Identicon value={account} size={iconSize} className="rounded-full border p-1" />
      <AccountName account={account} />
    </span>
  );
}
