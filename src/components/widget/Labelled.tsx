import { useMemo } from 'react';

import { LabelHelp } from './LabelHelp';

interface Props {
  className?: string;
  help?: React.ReactNode;
  isHidden?: boolean;
  isFull?: boolean;
  isOuter?: boolean;
  isSmall?: boolean;
  label?: React.ReactNode;
  labelExtra?: React.ReactNode;
  children: React.ReactNode;
  withEllipsis?: boolean;
  withLabel?: boolean;
}

const defaultLabel: React.ReactNode = <div>&nbsp;</div>;

// eslint-disable-next-line complexity
export const Labelled: React.FC<Props> = ({
  className,
  help,
  isHidden,
  isFull,
  isOuter,
  isSmall,
  label = defaultLabel,
  labelExtra,
  children,
  withEllipsis,
  withLabel = true,
}) => {
  const calcuClassName = useMemo(() => (isSmall || isFull || isOuter ? '' : ''), [isSmall, isFull, isOuter]);

  if (isHidden) {
    return null;
  } else if (!withLabel) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={`relative ${
        isOuter ? '' : 'border border-dashed rounded-lg px-3 py-1'
      } ml-4 mt-2 ${calcuClassName} ${className}`}
    >
      <label>
        {withEllipsis ? <div className="overflow-hidden overflow-ellipsis whitespace-nowrap">{label}</div> : label}
        {help && <LabelHelp help={help} />}
      </label>
      {labelExtra && <div className="text-right">{labelExtra}</div>}
      <div>{children}</div>
    </div>
  );
};
