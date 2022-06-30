import type { Codec } from '@polkadot/types/types';
import { useTranslation } from 'react-i18next';

import type { RawParam } from '../../../model/param';
import { toHumanJson } from '../../../utils/param';
import { Static } from '../Static';
import { Bare } from './Bare';

interface Props {
  asHex?: boolean;
  children?: React.ReactNode;
  childrenPre?: React.ReactNode;
  className?: string;
  defaultValue: RawParam;
  label?: React.ReactNode;
  withLabel?: boolean;
}

// eslint-disable-next-line complexity
export const StaticParam: React.FC<Props> = ({ asHex, children, childrenPre, className = '', defaultValue, label }) => {
  const { t } = useTranslation();

  const value =
    defaultValue &&
    (defaultValue.value as string) &&
    (asHex
      ? (defaultValue.value as Codec).toHex()
      : toHumanJson(
          (defaultValue.value as { toHuman?: () => unknown }).toHuman
            ? (defaultValue.value as Codec).toHuman()
            : defaultValue.value
        ));

  return (
    <Bare className={className}>
      {childrenPre}
      <Static className="full" label={label} value={<pre>{value || t('<empty>')}</pre>} />
      {children}
    </Bare>
  );
};
