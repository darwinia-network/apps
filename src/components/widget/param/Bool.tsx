import React, { useRef, useState } from 'react';
import { isBoolean } from '@polkadot/util';
import { useTranslation } from 'react-i18next';

import type { Props } from '../../../model/param';
import { Bare } from './Bare';
import { StaticParam } from './StaticParam';

export const BoolParam: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const {
    className = '',
    isDisabled,
    defaultValue: { value },
  } = props;

  const [defaultValue] = useState(value instanceof Boolean ? value.valueOf() : isBoolean(value) ? value : false);

  const options = useRef([
    { text: t('No'), value: false },
    { text: t('Yes'), value: true },
  ]);

  if (isDisabled) {
    return (
      <StaticParam
        {...props}
        defaultValue={{ isValid: true, value: options.current.find((item) => item.value === defaultValue)?.text }}
      />
    );
  }

  return <Bare className={className}>BoolParam Component</Bare>;
};
