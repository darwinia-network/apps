import { FormItemProps } from 'antd';
import { RequiredPartial } from '../../../model';

export type CustomFormControl = RequiredPartial<FormItemProps, 'label' | 'name'>;
