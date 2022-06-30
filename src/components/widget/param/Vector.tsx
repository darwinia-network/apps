import { isUndefined } from '@polkadot/util';
import { useState } from 'react';

import { useParamDefs } from '../../../hooks/param';
import type { ParamDef, RawParam, Props } from '../../../model/param';
import { Base } from './Base';
import { Params } from './Params';

function getParam([{ name, type }]: ParamDef[], index: number): ParamDef {
  return {
    name: `${index}: ${name || type.type}`,
    type,
  };
}

export function getParams(inputParams: ParamDef[], prev: ParamDef[], max: number): ParamDef[] {
  if (prev.length === max) {
    return prev;
  }

  const params: ParamDef[] = [];

  for (let index = 0; index < max; index++) {
    params.push(getParam(inputParams, index));
  }

  return params;
}

export function getValues({ value }: RawParam): RawParam[] {
  return Array.isArray(value)
    ? value.map((value: RawParam) =>
        isUndefined(value) || isUndefined(value.isValid) ? { isValid: !isUndefined(value), value } : value
      )
    : [];
}

export const Vector: React.FC<Props> = ({
  className = '',
  defaultValue,
  isDisabled = false,
  overrides,
  registry,
  type,
  label,
  withLabel,
}) => {
  const inputParams = useParamDefs(registry, type);
  const [values] = useState<RawParam[]>(() => getValues(defaultValue));
  const [count] = useState(() => values.length);
  const [params] = useState<ParamDef[]>(() => getParams(inputParams, [], count));

  return (
    <Base className={className} isOuter label={label} withLabel={withLabel}>
      <Params isDisabled={isDisabled} overrides={overrides} params={params} registry={registry} values={values} />
    </Base>
  );
};
