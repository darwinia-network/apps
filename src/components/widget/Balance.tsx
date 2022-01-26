import { Input, InputNumber, InputNumberProps } from 'antd';
import { GroupProps } from 'antd/lib/input';
import { omit } from 'lodash';
import { CSSProperties, PropsWithChildren, useCallback, useMemo } from 'react';
import { CustomFormControlProps } from '../../model';
import { getPrecisionByUnit } from '../../utils';

export function Balance({
  value,
  onChange,
  children,
  className,
  precision = getPrecisionByUnit('gwei'),
  ...other
}: CustomFormControlProps<string> & Omit<InputNumberProps<string>, 'value'> & PropsWithChildren<unknown> & GroupProps) {
  const triggerChange = useCallback(
    (val: string) => {
      if (onChange) {
        onChange(val);
      }
    },
    [onChange]
  );
  const getValue = useCallback(
    (inputValue: string) => {
      const [integer, decimal] = inputValue.split('.');

      if (!decimal) {
        return integer;
      }

      return decimal?.length > precision ? `${integer}.${decimal.slice(0, precision)}` : inputValue;
    },
    [precision]
  );
  const style = useMemo(() => {
    if (!children) {
      return {};
    }

    const sty: CSSProperties = {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    };

    return sty;
  }, [children]);

  return (
    <Input.Group compact={!!other.compact} className="items-center justify-between" style={{ display: 'flex' }}>
      <InputNumber<string>
        {...omit(other, 'compact')}
        className={className}
        style={style}
        value={value}
        min="0"
        stringMode
        precision={precision}
        onChange={(event) => {
          const inputValue = event ? event.replace(/,/g, '') : '';

          triggerChange(getValue(inputValue));
        }}
      />
      {children}
    </Input.Group>
  );
}
