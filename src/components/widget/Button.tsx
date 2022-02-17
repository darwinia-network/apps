import { Button, ButtonProps } from 'antd';
import { useMemo } from 'react';
import { Network } from '../../model';

interface IButtonProps extends ButtonProps {
  network?: Network;
  isGradient?: boolean;
}

export function IButton({ network, className, isGradient, ...rest }: IButtonProps) {
  const cls = useMemo(() => {
    let clsName = className ?? '';

    if (isGradient || network === 'darwinia') {
      clsName = `${clsName} hover:border-transparent`;
    }

    return clsName;
  }, [className, isGradient, network]);

  return <Button {...rest} className={cls} />;
}
