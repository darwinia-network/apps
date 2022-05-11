import { isString } from 'lodash';
import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Select } from 'antd';
import { format } from 'date-fns';
import { Deposit, DepositResponse, CustomFormItemProps } from '../../../model';
import { RecordsHook } from '../../../hooks';
import { getTimeRange } from '../../../utils';

const Selector = ({
  response,
  onChange = () => undefined,
}: {
  onChange?: (value: Deposit) => void;
  response: RecordsHook<DepositResponse>;
}) => {
  const { t } = useTranslation();
  const { loading, error, data } = response;

  const [disableDeposit, placeholderDeposit] = useMemo(
    () => [
      !!error || !data?.list.length,
      error ? t('Search deposit failed') : data?.list.length ? t('Please select deposit') : t('No record'),
    ],
    [error, data, t]
  );

  const triggerChange = useCallback(
    (id: number) => {
      const deposit = data?.list.find((item) => item.deposit_id === id);
      if (deposit) {
        onChange(deposit);
      }
    },
    [data, onChange]
  );

  return (
    <Select
      size="large"
      loading={loading}
      disabled={disableDeposit}
      placeholder={placeholderDeposit}
      onChange={triggerChange}
    >
      {data?.list.map((item) => {
        const { deposit_id, amount } = item;
        const { start, end } = getTimeRange(item.deposit_time, item.duration);
        const DATE_FORMAT = 'yyyy/MM/dd';

        return (
          <Select.Option key={deposit_id} value={deposit_id}>
            <span>
              {amount} RING
              <span>
                ({t('Deposit ID')}: {deposit_id} {t('Time')}: {format(start, DATE_FORMAT)} - {format(end, DATE_FORMAT)})
              </span>
            </span>
          </Select.Option>
        );
      })}
    </Select>
  );
};

export const DepositItem = ({
  label,
  name,
  response,
}: CustomFormItemProps<Deposit> & { response: RecordsHook<DepositResponse> }) => {
  const { t } = useTranslation();

  return (
    <Form.Item label={isString(label) ? t(label) : label} name={name} rules={[{ required: true }]}>
      <Selector response={response} />
    </Form.Item>
  );
};
