import { Typography, notification } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { Trans } from 'react-i18next';
import { useEffect, ReactElement } from 'react';
import { SubmittableResult } from '@polkadot/api';
import { useQueue, useApi } from '../../hooks';
import { SubscanLink } from './SubscanLink';

export const QueueStatus = () => {
  const { txqueue } = useQueue();
  const { network } = useApi();

  useEffect(() => {
    // eslint-disable-next-line complexity
    txqueue.forEach(({ error, status, extrinsic, rpc, id, result }) => {
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
      } else if (status === 'cancelled') {
        notification.warning({
          ...config,
          description: <Trans>The transaction has been cancelled</Trans>,
        });
      } else if (status === 'finalized' || status === 'inblock') {
        (result as SubmittableResult).events
          .filter(({ event: { section } }) => section === 'system')
          .forEach(({ event: { method } }): void => {
            const notice = (type: 'success' | 'error', message: ReactElement, txHash: string) =>
              notification[type]({
                ...config,
                description: (
                  <div>
                    <p>{message}</p>
                    <SubscanLink network={network.name} txHash={txHash}>
                      <Typography.Text copyable underline>
                        {txHash}
                      </Typography.Text>
                    </SubscanLink>
                  </div>
                ),
              });

            if (method === 'ExtrinsicFailed') {
              notice(
                'error',
                <Trans>The transaction has been failed, you can check the transaction in the explorer.</Trans>,
                (result as SubmittableResult).txHash.toHex()
              );
            } else if (method === 'ExtrinsicSuccess') {
              notice(
                'success',
                <Trans>
                  The transaction has been sent, please check the transaction progress in the history or explorer.
                </Trans>,
                (result as SubmittableResult).txHash.toHex()
              );
            }
          });
      }
    });
  }, [txqueue, network.name]);

  return null;
};
