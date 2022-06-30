import type { WithTranslation } from 'react-i18next';
import type { Registry, TypeDef } from '@polkadot/types/types';

export type RawParamValue = unknown | undefined;

export type RawParamValueArray = (RawParamValue | RawParamValue[])[];

export type RawParamValues = RawParamValue | RawParamValueArray;

export interface RawParam {
  isValid: boolean;
  value: RawParamValues;
}

export interface RawParamOnChangeValue {
  isValid: boolean;
  value: RawParamValues;
}

export type RawParamOnChange = (value: RawParamOnChangeValue) => void;
export type RawParamOnEnter = () => void;
export type RawParamOnEscape = () => void;

export type RawParams = RawParam[];

export interface Props {
  className?: string;
  defaultValue: RawParam;
  isDisabled?: boolean;
  isError?: boolean;
  isInOption?: boolean;
  isReadOnly?: boolean;
  isOptional?: boolean;
  label?: React.ReactNode;
  name?: string;
  onChange?: RawParamOnChange;
  onEnter?: RawParamOnEnter;
  onEscape?: RawParamOnEscape;
  overrides?: ComponentMap;
  registry: Registry;
  type: TypeDef & { withOptionActive?: boolean };
  withLabel?: boolean;
}

export type ComponentMap = Record<string, React.ComponentType<Props>>;

export interface ParamDef {
  length?: number;
  name?: string;
  type: TypeDef;
}

export interface BareProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export type I18nProps = BareProps & WithTranslation;
