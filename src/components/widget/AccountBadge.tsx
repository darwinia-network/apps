import Icon from '@ant-design/icons';
import { useState } from 'react';
import { IconProps } from '../icons/icon-factory';

interface Props {
  className?: string;
  color?: 'blue' | 'gray' | 'green' | 'highlight' | 'normal' | 'orange' | 'purple' | 'red' | 'transparent' | 'white';
  hover?: React.ReactNode;
  hoverAction?: React.ReactNode;
  icon?: (props: IconProps) => JSX.Element;
  info?: React.ReactNode;
  isSmall?: boolean;
  onClick?: () => void;
}

let badgeId = 0;

// eslint-disable-next-line complexity
export function Badge({
  className = '',
  color = 'normal',
  hover,
  hoverAction,
  icon,
  info,
  isSmall,
  onClick,
}: Props): React.ReactElement<Props> | null {
  const badgeTestId = `${icon ? `${icon}-` : ''}badge`;

  const [trigger] = useState(() => `${badgeTestId}-hover-${Date.now()}-${badgeId++}`);
  const extraProps = hover ? { 'data-for': trigger, 'data-tip': true } : {};
  const isHighlight = color === 'highlight';

  //   const hoverContent = useMemo(
  //     () => (
  //       <div className="hoverContent">
  //         <div>{hover}</div>
  //         {hoverAction && (
  //           <a className={`${color}Color`} onClick={onClick}>
  //             {hoverAction}
  //           </a>
  //         )}
  //       </div>
  //     ),
  //     [color, hover, hoverAction, onClick]
  //   );

  return (
    <div
      {...extraProps}
      className={`ui--Badge${hover ? ' isTooltip' : ''}${isSmall ? ' isSmall' : ''}${onClick ? ' isClickable' : ''}${
        isHighlight ? ' highlight--bg' : ''
      } ${color}Color ${className}${icon ? ' withIcon' : ''}${info ? ' withInfo' : ''}${
        hoverAction ? ' withAction' : ''
      } `}
      onClick={hoverAction ? undefined : onClick}
    >
      <div className={isHighlight ? 'highlight--color-contrast' : ''}>
        {icon && <Icon />}
        {info}
        {hoverAction && <Icon className="action-icon" />}
      </div>
      {/* {hover && <Tooltip className="accounts-badge" />} */}
    </div>
  );
}
