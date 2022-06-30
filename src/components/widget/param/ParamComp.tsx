import type { Registry, TypeDef } from '@polkadot/types/types';

import type { RawParam, RawParamOnChangeValue, ComponentMap, RawParams } from '../../../model/param';
import { Param } from './Param';

interface Props {
  defaultValue: RawParam;
  index: number;
  isDisabled?: boolean;
  name?: string;
  onChange?: (index: number, value: RawParamOnChangeValue) => void;
  onEnter?: () => void;
  onEscape?: () => void;
  overrides?: ComponentMap;
  registry: Registry;
  type: TypeDef;
  values?: RawParams | null;
}

export const ParamComp: React.FC<Props> = ({ defaultValue, isDisabled, name, overrides, registry, type }) => {
  return (
    <div>
      <Param
        defaultValue={defaultValue}
        isDisabled={isDisabled}
        name={name}
        overrides={overrides}
        registry={registry}
        type={type}
      />
    </div>
  );
};
