import { encodeTypeDef } from '@polkadot/types/create';
import { isUndefined } from '@polkadot/util';
import { useMemo } from 'react';

import { Props } from '../../../model/param';
import { findComponent } from './findComponent';

const formatJSON = (input: string): string => {
  return (
    input
      .replace(/"/g, '')
      .replace(/\\/g, '')
      .replace(/:Null/g, '')
      .replace(/:/g, ': ')
      // .replace(/{/g, '{ ')
      // .replace(/}/g, ' }')
      .replace(/,/g, ', ')
  );
};

export const Param: React.FC<Props> = ({
  isDisabled,
  isInOption,
  registry,
  type,
  name,
  overrides,
  className,
  defaultValue,
}) => {
  const Component = useMemo(() => findComponent(registry, type, overrides), [registry, type, overrides]);

  // eslint-disable-next-line complexity
  const label = useMemo((): string => {
    const fmtType = formatJSON(
      `${isDisabled && isInOption ? 'Option<' : ''}${encodeTypeDef(registry, type)}${
        isDisabled && isInOption ? '>' : ''
      }`
    );

    return `${isUndefined(name) ? '' : `${name}: `}${fmtType}${
      type.typeName && !fmtType.includes(type.typeName) ? ` (${type.typeName})` : ''
    }`;
  }, [isDisabled, isInOption, name, registry, type]);

  if (!Component) {
    return null;
  }

  return (
    <Component
      className={`${className}`}
      defaultValue={defaultValue}
      isDisabled={isDisabled}
      isInOption={isInOption}
      label={label}
      name={name}
      overrides={overrides}
      registry={registry}
      type={type}
    />
  );
};
