import { PropsWithChildren, ReactNode } from 'react';
import { isString } from 'lodash';

interface Props {
  className?: string;
  label?: ReactNode;
}

export const Output = ({ children, label, className }: PropsWithChildren<Props>) => {
  return (
    <div className={`flex flex-col border border-dashed rounded-lg px-3 py-1 ${className}`}>
      {isString(label) ? <span className="opacity-60">{label}</span> : label}
      {children}
    </div>
  );
};
