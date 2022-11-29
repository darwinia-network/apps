import { Table, Typography } from 'antd';
import { useMemo } from 'react';
import { ColumnsType } from 'antd/es/table';
import { format, fromUnixTime } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { RecordsHook } from '../../../hooks';
import { DepositResponse } from '../../../model';
import { DATE_FORMAT, ethereumConfig } from '../../../config';
import { ViewBrowserIcon } from '../../../components/icons';

interface HistoryState {
  depositId: number;
  amount: string; // RING
  reward: string; // KTON
  withdrawTime: number;
  withdrawTx: string;
}

const columns: ColumnsType<HistoryState> = [
  {
    key: 'depositId',
    title: 'Deposit Id',
    dataIndex: 'depositId',
    align: 'center',
  },
  {
    key: 'amount',
    title: 'Amount (RING)',
    dataIndex: 'amount',
    align: 'center',
  },
  {
    key: 'reward',
    title: 'Reward (KTON)',
    dataIndex: 'reward',
    align: 'center',
  },
  {
    key: 'withdrawTime',
    title: 'Withdraw Time',
    dataIndex: 'withdrawTime',
    align: 'center',
    render: (time) => format(fromUnixTime(time), DATE_FORMAT),
  },
  {
    key: 'withdrawTx',
    title: 'Transaction',
    dataIndex: 'withdrawTx',
    align: 'center',
    render: (hash) =>
      hash ? (
        <Typography.Link
          rel="noopener noreferrer"
          target="_blank"
          href={`${ethereumConfig.blockExplorerUrls}tx/${hash}`}
        >
          <ViewBrowserIcon />
        </Typography.Link>
      ) : (
        <Typography.Text>Sent</Typography.Text>
      ),
  },
];

export const ClaimHistory = ({ response }: { response: RecordsHook<DepositResponse> }) => {
  const { t } = useTranslation();
  const { loading, error, data } = response;

  const claimed = useMemo(
    () => data?.list.filter((item) => item.withdraw_tx || item.map_status === 'sent') || [],
    [data?.list]
  );

  const dataSource = useMemo<HistoryState[]>(
    () =>
      claimed.map((item) => ({
        key: item.deposit_id,
        depositId: item.deposit_id,
        amount: item.amount,
        reward: item.reward,
        withdrawTime: item.withdraw_time,
        withdrawTx: item.withdraw_tx,
      })) || [],
    [claimed]
  );

  return error || !claimed.length ? null : (
    <Table title={() => t('Claim History')} loading={loading} columns={columns} dataSource={dataSource} />
  );
};
