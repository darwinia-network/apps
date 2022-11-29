import { isString } from 'lodash';
import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Select } from 'antd';
import { format } from 'date-fns';
import { Deposit, DepositResponse, CustomFormItemProps } from '../../../model';
import { RecordsHook } from '../../../hooks';
import { getTimeRange } from '../../../utils';
import { DATE_FORMAT } from '../../../config';

const getSencondFromMonth = (month: number) => {
  // eslint-disable-next-line no-magic-numbers
  return month * 30 * 24 * 60 * 60;
};

const isEnding = (startTime: number, durationTime: number) => {
  const current = Date.now();
  // eslint-disable-next-line no-magic-numbers
  const start = startTime * 1000;
  // eslint-disable-next-line no-magic-numbers
  const duration = getSencondFromMonth(durationTime) * 1000;
  return current >= start + duration;
};

const Selector = ({
  response,
  onChange = () => undefined,
}: {
  onChange?: (value: Deposit) => void;
  response: RecordsHook<DepositResponse>;
}) => {
  const { t } = useTranslation();
  const { loading, error, data } = response;

  const unclaim = useMemo(
    () =>
      data?.list.filter(
        (item) => !(item.withdraw_tx || item.map_status) && isEnding(item.deposit_time, item.duration)
      ) || [],
    [data?.list]
  );

  const [disableDeposit, placeholderDeposit] = useMemo(
    () => [
      !!error || !unclaim.length,
      error ? t('Search deposit failed') : unclaim.length ? t('Please select deposit') : t('No record'),
    ],
    [error, unclaim, t]
  );

  const triggerChange = useCallback(
    (id: number) => {
      const deposit = unclaim.find((item) => item.deposit_id === id);
      if (deposit) {
        onChange(deposit);
      }
    },
    [unclaim, onChange]
  );

  return (
    <Select
      size="large"
      loading={loading}
      disabled={disableDeposit}
      placeholder={placeholderDeposit}
      onChange={triggerChange}
    >
      {unclaim.map((item) => {
        const { deposit_id, amount } = item;
        const { start, end } = getTimeRange(item.deposit_time, item.duration);

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
