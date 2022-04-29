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

      const config = {
        key: id.toString(),
        message: `${section}.${method}`,
        duration: null,
      };

      if (status === 'error') {
        notification.error({
          ...config,
          description: error?.message,
        });
      } else if (status === 'signing') {
        notification.info({
          ...config,
          description: <Trans>Waiting for approve, you need to approve this transaction in your wallet</Trans>,
        });
      } else if (status === 'broadcast') {
        notification.info({
          ...config,
          description: <Trans>Has been broadcast, waiting for the node to receive</Trans>,
          icon: <SyncOutlined spin />,
        });
      } else if (status === 'inblock') {
        notification.info({
          ...config,
          description: <Trans>The transaction has been packaged</Trans>,
          icon: <SyncOutlined spin />,
        });
      } else if (status === 'cancelled') {
        notification.warning({
          ...config,
          description: <Trans>The transaction has been cancelled</Trans>,
        });
      }
    });
  }, [txqueue]);

  return null;
};
