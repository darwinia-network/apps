import { PropsWithChildren } from 'react';

export const Bare = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
  <div className={`relative ${className}`}>{children}</div>
);
