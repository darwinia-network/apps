import { useMemo, useState } from 'react';
import { NETWORK_THEME, THEME } from '../../config';
import { readStorage } from '../../utils/helper/storage';

interface BallScalePulseProps {
  size?: number;
}

const DEFAULT_SIZE = 24;

export function BallScalePulse({ size = DEFAULT_SIZE }: BallScalePulseProps) {
  const [theme] = useState(readStorage().theme ?? THEME.LIGHT);
  const [network] = useState(readStorage().activeNetwork?.name ?? 'darwinia');
  const childCls = useMemo(() => {
    return `absolute box-border inline-block float-none bg-current  border-0 border-solid border-current top-0 left-0 w-${size} h-${size} rounded-full opacity-50 animate-ball-scale-pulse`;
  }, [size]);
  const color = useMemo(() => NETWORK_THEME[theme][network]['@project-primary'], [theme, network]);

  return (
    <div className={`relative box-border block w-${size} h-${size}`} style={{ fontSize: 0, color }}>
      <div className={childCls}></div>
      <div className={childCls} style={{ animationDelay: '-1s' }}></div>
    </div>
  );
}
