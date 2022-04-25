import { notification } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { Trans } from 'react-i18next';
import { useQueue } from '../../hooks';

export const QueueStatus = () => {
  const { txqueue } = useQueue();

  // eslint-disable-next-line complexity
  txqueue.forEach(({ error, status, extrinsic, rpc }) => {
    let { method, section } = rpc;

    if (extrinsic) {
      const found = extrinsic.registry.findMetaCall(extrinsic.callIndex);

      if (found.section !== 'unknown') {
        method = found.method;
        section = found.section;
      }
    }

    if (error) {
      return notification.error({
        message: `${section}.${method}`,
        description: error,
      });
    }

    if (status === 'signing') {
      return notification.info({
        message: `${section}.${method}`,
        description: <Trans>Waiting for approve, you need to approve this transaction in your wallet</Trans>,
        duration: null,
      });
    }

    if (status === 'broadcast') {
      return notification.info({
        message: `${section}.${method}`,
        description: <Trans>Has been broadcast, waiting for the node to receive</Trans>,
        icon: <SyncOutlined spin />,
        duration: null,
      });
    }

    if (status === 'queued') {
      return notification.info({
        message: `${section}.${method}`,
        description: <Trans>Has been added to the queue, waiting to be packaged</Trans>,
        icon: <SyncOutlined spin />,
        duration: null,
      });
    }

    if (status === 'inblock') {
      return notification.info({
        message: `${section}.${method}`,
        description: <Trans>The transaction has been packaged</Trans>,
        icon: <SyncOutlined spin />,
        duration: null,
      });
    }

    if (status === 'finalized') {
      return notification.success({
        message: `${section}.${method}`,
        description: (
          <Trans>
            The transaction has been sent, please check the transaction progress in the history or explorer.
          </Trans>
        ),
      });
    }
  });

  return null;
};
