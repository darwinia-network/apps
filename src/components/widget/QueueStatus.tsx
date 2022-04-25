import { notification } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { Trans } from 'react-i18next';
import { useEffect } from 'react';
import { useQueue } from '../../hooks';

export const QueueStatus = () => {
  const { txqueue } = useQueue();

  useEffect(() => {
    // eslint-disable-next-line complexity
    txqueue.forEach(({ error, status, extrinsic, rpc, id }) => {
      let { method, section } = rpc;

      if (extrinsic) {
        const found = extrinsic.registry.findMetaCall(extrinsic.callIndex);

        if (found.section !== 'unknown') {
          method = found.method;
          section = found.section;
        }
      }

      if (status === 'error') {
        return notification.error({
          message: `${section}.${method}`,
          description: error?.message,
          duration: null,
          key: id.toString(),
        });
      }

      if (status === 'signing') {
        return notification.info({
          message: `${section}.${method}`,
          description: <Trans>Waiting for approve, you need to approve this transaction in your wallet</Trans>,
          duration: null,
          key: id.toString(),
        });
      }

      if (status === 'broadcast') {
        return notification.info({
          message: `${section}.${method}`,
          description: <Trans>Has been broadcast, waiting for the node to receive</Trans>,
          icon: <SyncOutlined spin />,
          duration: null,
          key: id.toString(),
        });
      }

      if (status === 'queued') {
        return notification.info({
          message: `${section}.${method}`,
          description: <Trans>Has been added to the queue, waiting to be packaged</Trans>,
          duration: null,
          key: id.toString(),
        });
      }

      if (status === 'inblock') {
        return notification.info({
          message: `${section}.${method}`,
          description: <Trans>The transaction has been packaged</Trans>,
          icon: <SyncOutlined spin />,
          duration: null,
          key: id.toString(),
        });
      }

      if (status === 'cancelled') {
        return notification.warning({
          message: `${section}.${method}`,
          description: <Trans>The transaction has been cancelled</Trans>,
          duration: null,
          key: id.toString(),
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
          duration: null,
          key: id.toString(),
        });
      }
    });
  }, [txqueue]);

  return null;
};
