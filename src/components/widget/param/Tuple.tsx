import type { Props } from '../../../model/param';
import { Bare } from './Bare';
import { StaticParam } from './StaticParam';

export const Tuple: React.FC<Props> = (props) => {
  const { className = '', isDisabled } = props;

  if (isDisabled) {
    return <StaticParam {...props} />;
  }

  return <Bare className={className}>Tuple Component</Bare>;
};
