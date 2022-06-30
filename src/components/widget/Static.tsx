import { Button } from 'antd';
import { Labelled } from './Labelled';

interface Props {
  children?: React.ReactNode;
  className?: string;
  defaultValue?: unknown;
  help?: React.ReactNode;
  isDisabled?: boolean;
  isError?: boolean;
  isFull?: boolean;
  isHidden?: boolean;
  isSmall?: boolean;
  label?: React.ReactNode;
  value?: React.ReactNode;
  withCopy?: boolean;
  withLabel?: boolean;
}

export const Static: React.FC<Props> = ({
  children,
  className = '',
  defaultValue,
  help,
  isFull,
  isHidden,
  isSmall,
  label,
  value,
  withCopy,
  withLabel,
}) => {
  return (
    <Labelled
      className={className}
      help={help}
      isFull={isFull}
      isHidden={isHidden}
      isSmall={isSmall}
      label={label}
      withLabel={withLabel}
    >
      <div>
        {value || defaultValue}
        {children}
      </div>
      {withCopy && <Button>Copy</Button>}
    </Labelled>
  );
};
