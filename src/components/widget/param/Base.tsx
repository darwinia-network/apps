import { Labelled } from '../Labelled';
import { Bare } from './Bare';

interface Props {
  children?: React.ReactNode;
  className?: string;
  isDisabled?: boolean;
  isOuter?: boolean;
  label?: React.ReactNode;
  withLabel?: boolean;
}

export const Base = ({ children, className = '', isOuter, label, withLabel }: Props): React.ReactElement<Props> => {
  return (
    <Bare className={className}>
      <Labelled isOuter label={label} withEllipsis withLabel={withLabel}>
        {!isOuter && children}
      </Labelled>
      {isOuter && children}
    </Bare>
  );
};
