import { Card, Descriptions, Badge, Divider, Breadcrumb, Spin } from 'antd';
import { NavLink } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { formatDistance } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { Path } from '../../config/routes';
import { ORDER_DETAIL, LONG_LONG_DURATION } from '../../config';
import { OrderDetailData, CrossChainDestination, SlotState, RelayerRole } from '../../model';
import { useApi } from '../../hooks';
import { SubscanLink } from '../widget/SubscanLink';
import { fromWei, prettyNumber } from '../../utils';
import { AccountName } from '../widget/account/AccountName';

// eslint-disable-next-line complexity
export const OrderDetail = ({ orderid, destination }: { orderid: string; destination: CrossChainDestination }) => {
  const { network } = useApi();
  const { t } = useTranslation();
  const { loading, data } = useQuery(ORDER_DETAIL, {
    variables: { orderid: `${destination}-${orderid}` },
    pollInterval: LONG_LONG_DURATION,
    notifyOnNetworkStatusChange: true,
  }) as { loading: boolean; data: OrderDetailData | null };

  return (
    <>
      <Breadcrumb separator=">">
        <Breadcrumb.Item>
          <NavLink to={`${Path.feemarket}?tab=orders`}>{t('Orders')}</NavLink>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{orderid}</Breadcrumb.Item>
      </Breadcrumb>

      <Card className="mt-1">
        <Spin spinning={loading}>
          <Descriptions column={1}>
            <Descriptions.Item label={t('Nonce')}>{orderid || '-'}</Descriptions.Item>
            <Descriptions.Item label={t('Lane ID')}>{data?.orderEntity?.createLaneId || '-'}</Descriptions.Item>
            <Descriptions.Item label={t('Source TxID')}>
              {data?.orderEntity?.sourceTxHash ? (
                <SubscanLink network={network.name} txHash={data.orderEntity.sourceTxHash} />
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t('Sender')}>
              {data?.orderEntity?.sender ? (
                <SubscanLink copyable address={data.orderEntity.sender} network={network.name} />
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t('State')}>
              {data?.orderEntity?.confirmedSlotIndex === undefined ? (
                <Badge status="processing" text={t('Cross-chain in progress')} />
              ) : data.orderEntity.confirmedSlotIndex === -1 ? (
                <Badge status="warning" text={t('Cross-chain out of slot')} />
              ) : (
                <Badge status="success" text={t('Cross-chain success')} />
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t('Cross-chain fee')}>
              {data?.orderEntity?.fee
                ? `${fromWei({ value: data.orderEntity.fee }, prettyNumber)} ${network.tokens.ring.symbol}`
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('Priority slot')}>
              {data?.orderEntity?.confirmedSlotIndex === undefined
                ? '-'
                : data.orderEntity.confirmedSlotIndex === -1
                ? t(SlotState.OUT_OF_SLOT)
                : `#${data.orderEntity.confirmedSlotIndex + 1}`}
            </Descriptions.Item>
          </Descriptions>

          <Divider className="my-2" />

          <Descriptions column={1}>
            <Descriptions.Item label={t('Start Block')}>
              {data?.orderEntity?.createBlock ? (
                <SubscanLink network={network.name} block={data.orderEntity.createBlock.toString()} prefix="#" />
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t('Start Time')}>
              {data?.orderEntity?.createTime
                ? `${formatDistance(new Date(data.orderEntity.createTime), new Date(), { addSuffix: true })} ( ${
                    data.orderEntity.createTime
                  } )`
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('Confirm Block')}>
              {data?.orderEntity?.finishBlock ? (
                <SubscanLink network={network.name} block={data.orderEntity.finishBlock.toString()} prefix="#" />
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t('Confirm Time')}>
              {data?.orderEntity?.finishTime
                ? `${formatDistance(new Date(data.orderEntity.finishTime), new Date(), { addSuffix: true })} ( ${
                    data.orderEntity.finishTime
                  } )`
                : '-'}
            </Descriptions.Item>
          </Descriptions>

          {data?.orderEntity?.rewards.nodes.length ? (
            <>
              <Divider className="my-2" />
              <Descriptions column={1} title={t('Rewards:')}>
                {data.orderEntity.rewards.nodes[0].assignedRelayerId && (
                  <Descriptions.Item label={t(RelayerRole.ASSIGNED)}>
                    <AccountName account={data.orderEntity.rewards.nodes[0].assignedRelayerId.split('-')[1]} />
                    <span>
                      &nbsp;
                      {`| ${fromWei({ value: data.orderEntity.rewards.nodes[0].assignedAmount }, prettyNumber)} ${
                        network.tokens.ring.symbol
                      }`}
                    </span>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label={t(RelayerRole.DELIVERY)}>
                  <AccountName account={data.orderEntity.rewards.nodes[0].deliveredRelayerId.split('-')[1]} />
                  <span>
                    &nbsp;
                    {`| ${fromWei({ value: data.orderEntity.rewards.nodes[0].deliveredAmount }, prettyNumber)} ${
                      network.tokens.ring.symbol
                    }`}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label={t(RelayerRole.CONFIRMED)}>
                  <AccountName account={data.orderEntity.rewards.nodes[0].confirmedRelayerId.split('-')[1]} />
                  <span>
                    &nbsp;
                    {`| ${fromWei({ value: data.orderEntity.rewards.nodes[0].confirmedAmount }, prettyNumber)} ${
                      network.tokens.ring.symbol
                    }`}
                  </span>
                </Descriptions.Item>
                {data.orderEntity.rewards.nodes[0].treasuryAmount && (
                  <Descriptions.Item label={t('To Treaury')}>{`${fromWei(
                    { value: data.orderEntity.rewards.nodes[0].treasuryAmount },
                    prettyNumber
                  )} ${network.tokens.ring.symbol}`}</Descriptions.Item>
                )}
              </Descriptions>
            </>
          ) : null}

          {data?.orderEntity?.slashs.nodes.length ? (
            <>
              <Divider className="my-2" />
              <Descriptions column={1} title={t('Slashs:')}>
                <Descriptions.Item label={t('Sent Block')}>
                  <SubscanLink
                    network={network.name}
                    block={data.orderEntity.slashs.nodes[0].sentTime.toString()}
                    prefix="#"
                  />
                </Descriptions.Item>
                <Descriptions.Item label={t('Confirm Block')}>
                  <SubscanLink
                    network={network.name}
                    block={data.orderEntity.slashs.nodes[0].confirmTime.toString()}
                    prefix="#"
                  />
                </Descriptions.Item>
                <Descriptions.Item label={t('Delay Blocks')}>
                  {data.orderEntity.slashs.nodes[0].delayTime}
                </Descriptions.Item>
                {data?.orderEntity?.slashs.nodes.map((node) => (
                  <Descriptions.Item label={t(RelayerRole.ASSIGNED)} key={node.relayerId}>
                    <AccountName account={node.relayerId.split('-')[1]} />
                    <span>
                      &nbsp;{`| ${fromWei({ value: node.amount }, prettyNumber)} ${network.tokens.ring.symbol}`}
                    </span>
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </>
          ) : null}
        </Spin>
      </Card>
    </>
  );
};
