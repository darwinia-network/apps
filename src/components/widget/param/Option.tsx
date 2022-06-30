import type { Codec, TypeDef } from '@polkadot/types/types';
import { Option } from '@polkadot/types';
import React, { useState } from 'react';

import type { Props } from '../../../model/param';
import { Param } from './Param';

const DEF_VALUE = { isValid: true, value: undefined };

export const OptionDisplay: React.FC<Props> = ({
  className = '',
  defaultValue: _defaultValue,
  isDisabled,
  name,
  onChange,
  onEnter,
  onEscape,
  registry,
  type: { sub, withOptionActive },
}) => {
  const [isActive] = useState(
    () =>
      withOptionActive ||
      !!(_defaultValue && _defaultValue.value instanceof Option && _defaultValue.value.isSome) ||
      false
  );
  // eslint-disable-next-line complexity
  const [defaultValue] = useState(() =>
    isActive || isDisabled
      ? _defaultValue &&
        (_defaultValue.value instanceof Option && _defaultValue.value.isSome
          ? { isValid: _defaultValue.isValid, value: (_defaultValue.value as Option<Codec>).unwrap() }
          : DEF_VALUE)
      : DEF_VALUE
  );

  return (
    <div className={className}>
      <Param
        defaultValue={isActive ? defaultValue : DEF_VALUE}
        isDisabled={isDisabled || !isActive}
        isInOption
        isOptional={!isActive && !isDisabled}
        name={name}
        onChange={onChange}
        onEnter={onEnter}
        onEscape={onEscape}
        registry={registry}
        type={sub as TypeDef}
      />
    </div>
  );
};
