import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { Alert, AlertProps, Button, Typography } from 'antd';
import { Trans } from 'react-i18next';
import { Tx, Network } from '../../model';
import { useApi } from '../../hooks';
import { SubscanLink } from './SubscanLink';

interface TxStatusProps extends Partial<AlertProps> {
  tx: Tx | null;
  cancel: () => void;
}

// eslint-disable-next-line complexity
const getAlertProps = (tx: Tx, network: Network, cancel: () => void): AlertProps => {
  if (tx.status === 'signing') {
    return {
      type: 'info',
      message: <Trans>Waiting for approve, you need to approve this transaction in your wallet</Trans>,
      icon: <InfoCircleOutlined />,
    };
  }

  if (tx.status === 'broadcast') {
    return {
      type: 'info',
      message: <Trans>Has been broadcast, waiting for the node to receive</Trans>,
      icon: <SyncOutlined spin />,
    };
  }

  if (tx.status === 'queued') {
    return {
      type: 'info',
      message: <Trans>Has been added to the queue, waiting to be packaged</Trans>,
      icon: <SyncOutlined spin />,
    };
  }

  if (tx.status === 'inblock') {
    return { type: 'info', message: <Trans>The transaction has been packaged</Trans>, icon: <SyncOutlined spin /> };
  }

  if (tx.status === 'finalized') {
    return {
      type: 'success',
      message: (
        <div>
          <p>
            <Trans>
              The transaction has been sent, please check the transaction progress in the history or explorer.
            </Trans>
          </p>
          <SubscanLink network={network} txHash={tx.hash}>
            <Typography.Text copyable underline>
              {tx.hash}
            </Typography.Text>
          </SubscanLink>
        </div>
      ),
      icon: <CheckCircleOutlined />,
    };
  }

  if (tx.status === 'error') {
    return { type: 'error', message: tx.error, icon: <CloseCircleOutlined /> };
  }

  return {
    type: 'info',
    message: (
      <span className="flex items-center justify-between">
        <Trans>Processing</Trans>
        {cancel && (
          <Button size="small" type="link" onClick={cancel}>
            <Trans>Cancel</Trans>
          </Button>
        )}
      </span>
    ),
    icon: <InfoCircleOutlined />,
  };
};

export function TxStatus({ tx, cancel, ...others }: TxStatusProps) {
  const { network } = useApi();

  if (!tx) {
    return null;
  }

  const { type, message, icon } = getAlertProps(tx, network.name, cancel);

  return (
    <Alert
      {...others}
      className="flex fixed top-2 inset-x-2 md:inset-x-auto md:top-20 md:right-8 border-none md:max-w-sm"
      message={message}
      icon={icon}
      type={type}
      showIcon
      style={{ zIndex: 1009 }}
      closable={type === 'success' || type === 'error'}
    />
  );
}
