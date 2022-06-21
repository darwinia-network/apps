import { Button, Input, InputNumber, InputNumberProps } from 'antd';
import { GroupProps } from 'antd/lib/input';
import { omit } from 'lodash';
import { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomFormControlProps } from '../../../model';
import { getPrecisionByUnit } from '../../../utils';

type BalanceControlProps = CustomFormControlProps<string> &
  Omit<InputNumberProps<string>, 'value'> &
  PropsWithChildren<unknown> &
  GroupProps & { max?: string };

export function BalanceControl({
  value,
  onChange,
  children,
  className,
  max,
  precision = getPrecisionByUnit('gwei'),
  ...other
}: BalanceControlProps) {
  const { t } = useTranslation();
  const [data, setData] = useState(value);
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

  useEffect(() => {
    setData(value);
  }, [value]);

  return (
    <Input.Group compact={!!other.compact} className="items-center justify-between" style={{ display: 'flex' }}>
      <InputNumber<string>
        {...omit(other, 'compact')}
        className={className}
        value={data}
        min="0"
        stringMode
        onChange={(event) => {
          const inputValue = event ? event.replace(/,/g, '') : '';
          const val = getValue(inputValue);

          setData(val);
          triggerChange(val);
        }}
        onKeyDown={(e) => e.stopPropagation()}
      />
      {children}
      {max && (
        <Button
          size="large"
          type="primary"
          onClick={() => {
            setData(max);
            triggerChange(max);
          }}
        >
          {t('Max')}
        </Button>
      )}
    </Input.Group>
  );
}
