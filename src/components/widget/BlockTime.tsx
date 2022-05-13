import { BN } from '@polkadot/util';
import { useBlockTime } from '../../hooks/blockTime';

interface BlockTimeProps {
  children?: React.ReactNode;
  className?: string;
  isInline?: boolean;
  label?: React.ReactNode;
  value?: BN;
}

export function BlockTime({
  children,
  className = '',
  isInline,
  label,
  value,
}: BlockTimeProps): React.ReactElement<BlockTimeProps> | null {
  const [, text] = useBlockTime(value);

  if (!value || value.isZero()) {
    return null;
  }

  return (
    <div className={`${className}${isInline ? ' isInline' : ''}`}>
      {label || ''}
      {text.split(' ').map((v, index) => (
        // eslint-disable-next-line no-magic-numbers
        <span className={index % 2 ? 'timeUnits' : undefined} key={index}>
          {v}
        </span>
      ))}
      {children}
    </div>
  );
}
