import { Typography, notification } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { Trans } from 'react-i18next';
import { useEffect, ReactNode } from 'react';
import { SubmittableResult } from '@polkadot/api';
import { useQueue, useApi, useNetworkColor } from '../../hooks';
import { Path } from '../../config/routes';
import { SubscanLink } from './SubscanLink';

type NotificationConfig = {
  key?: string;
  message?: ReactNode;
  duration?: number;
  icon?: ReactNode;
  description: ReactNode;
  type: 'success' | 'error' | 'info' | 'warning' | 'open';
};

const AccountMigrationLink = ({ children }: { children: ReactNode }) => {
  const searchParamsStr = new URLSearchParams(window.location.search).toString();
  return <a href={searchParamsStr.length ? `${Path.migration}?${searchParamsStr}` : Path.migration}>{children}</a>;
};

export const QueueStatus = () => {
  const { txqueue } = useQueue();
  const { network } = useApi();
  const { color } = useNetworkColor();

  useEffect(() => {
    // eslint-disable-next-line complexity
    txqueue.forEach(({ error, status, extrinsic, rpc, id, result }) => {
      let config: NotificationConfig | undefined = undefined;

      if (status === 'error') {
        if (error?.message && error.message.includes('Unable to retrieve keypair')) {
          config = {
            type: 'error',
            description: (
              <span>
                {error.message}. Check on the <AccountMigrationLink>Account Migration</AccountMigrationLink> Page or
                restore your account with your backup files.
              </span>
            ),
          };
        } else {
          config = {
            type: 'error',
            description: error?.message,
          };
        }
      } else if (status === 'signing') {
        config = {
          type: 'info',
          description: <Trans>Waiting for approve, you need to approve this transaction in your wallet</Trans>,
        };
      } else if (status === 'broadcast') {
        config = {
          type: 'info',
          description: <Trans>Has been broadcast, waiting for the node to receive</Trans>,
          icon: <SyncOutlined spin className={color} />,
        };
      } else if (status === 'cancelled') {
        config = {
          type: 'warning',
          description: <Trans>The transaction has been cancelled</Trans>,
        };
      } else if (status === 'finalized' || status === 'inblock') {
        (result as SubmittableResult).events
          .filter(({ event: { section } }) => section === 'system')
          .forEach(({ event: { method } }): void => {
            const txHash = (result as SubmittableResult).txHash.toHex();
            if (method === 'ExtrinsicFailed') {
              config = {
                type: 'error',
                description: (
                  <div>
                    <p>
                      <Trans>The transaction has been failed, you can check the transaction in the explorer.</Trans>
                    </p>
                    <SubscanLink network={network.name} txHash={txHash}>
                      <Typography.Text copyable underline>
                        {txHash}
                      </Typography.Text>
                    </SubscanLink>
                  </div>
                ),
              };
            } else if (method === 'ExtrinsicSuccess') {
              config = {
                type: 'success',
                description: (
                  <div>
                    <p>
                      <Trans>
                        The transaction has been sent, please check the transaction progress in the history or explorer.
                      </Trans>
                    </p>
                    <SubscanLink network={network.name} txHash={txHash}>
                      <Typography.Text copyable underline>
                        {txHash}
                      </Typography.Text>
                    </SubscanLink>
                  </div>
                ),
              };
            }
          });
      }

      if (config) {
        let { method, section } = rpc;
        const { key, message, duration, icon, description, type } = config;

        if (extrinsic) {
          const found = extrinsic.registry.findMetaCall(extrinsic.callIndex);
          if (found.section !== 'unknown') {
            method = found.method;
            section = found.section;
          }
        }

        notification[type]({
          key: key ?? id.toString(),
          message: message ?? `${section}.${method}`,
          duration: duration ?? null,
          description,
          icon,
        });
      }
    });
  }, [txqueue, network.name, color]);

  return null;
};
