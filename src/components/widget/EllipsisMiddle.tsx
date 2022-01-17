import { Typography } from 'antd';
import { PropsWithChildren } from 'react';

const DISPLAY_PERCENT = 37.5;

export function EllipsisMiddle({
  children,
  className,
  percent = DISPLAY_PERCENT,
}: PropsWithChildren<{ className?: string; percent?: number }>) {
  return (
    <div className={`w-full whitespace-nowrap ${className}`}>
      <span
        className="whitespace-nowrap overflow-hidden align-middle inline-block overflow-ellipsis"
        style={{ width: `calc(${percent}% + 1.2em)` }}
      >
        {children}
      </span>
      <Typography.Text
        className="whitespace-nowrap overflow-hidden align-middle inline-flex justify-end"
        copyable
        style={{ width: `calc(${percent}% - 1.45em)`, marginLeft: '-0.35em', color: 'inherit' }}
      >
        {children}
      </Typography.Text>
    </div>
  );
}
