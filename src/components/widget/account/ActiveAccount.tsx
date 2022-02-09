import React, { CSSProperties, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../../hooks';

export function ActiveAccount({
  children,
  logoStyle,
  containerStyle,
  isLargeRounded = true,
  className = '',
  onClick = () => {
    // do nothing
  },
}: React.PropsWithChildren<{
  isLargeRounded?: boolean;
  logoStyle?: CSSProperties;
  containerStyle?: CSSProperties;
  className?: string;
  textClassName?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}>) {
  const { network } = useApi();
  const containerCls = useMemo(
    () =>
      `flex items-center justify-between leading-normal whitespace-nowrap p-1 overflow-hidden bg-${network.name} 
        ${isLargeRounded ? 'rounded-xl ' : 'rounded-lg '}
        ${className}`,
    [isLargeRounded, className, network]
  );
  const { t } = useTranslation();

  return (
    <div className={containerCls} onClick={onClick} style={containerStyle || {}}>
      <img src={network.facade.logo} style={logoStyle || { height: 24 }} className="hidden sm:inline-block" alt="" />
      <span className="text-white mx-2 hidden sm:inline">{t(network.name)}</span>
      {children}
    </div>
  );
}
