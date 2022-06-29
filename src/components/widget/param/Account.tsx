import { useState } from 'react';
import type { Props } from '../../../model/param';
import { InputAddress } from '../InputAddress';
import { Bare } from './Bare';

export const Account = ({ className, defaultValue: { value } }: Props) => {
  const [defaultValue] = useState(() => (value as string)?.toString());

  return (
    <Bare className={className}>
      <InputAddress defaultValue={defaultValue} />
    </Bare>
  );
};
