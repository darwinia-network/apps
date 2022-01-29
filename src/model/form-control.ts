import { FormItemProps } from 'antd';
import { RequiredPartial } from './type-operator';

export interface CustomFormControlProps<T = string> {
  value?: T;
  onChange?: (value: T) => void;
}

export type CustomFormItemProps<T = string> = RequiredPartial<FormItemProps, 'label' | 'name'> &
  CustomFormControlProps<T>;
