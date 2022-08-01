import { Card, Descriptions, Badge, Divider, Breadcrumb, Spin } from 'antd';
import { NavLink } from 'react-router-dom';
import { formatDistance, format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

import { Path } from '../../config/routes';
import { ORDER_DETAIL, DATE_TIME_FORMATE } from '../../config';
import {
  CrossChainDestination,
  SlotState,
  RelayerRole,
  SubqlOrderStatus,
  OrderStatus,
  OrderDetailData,
  OrderDetailState,
} from '../../model';
import { useApi, usePollIntervalQuery } from '../../hooks';
import { SubscanLink } from '../widget/SubscanLink';
import { fromWei, prettyNumber, transformOrderDetail } from '../../utils';
import { AccountName } from '../widget/account/AccountName';

const getPrioritySlot = (confirmedSlotIndex?: number | null): string => {
  switch (confirmedSlotIndex) {
    case -1:
      return SlotState.OUT_OF_SLOT;
    case 0:
    case 1:
    case 2: // eslint-disable-line no-magic-numbers
      return `${confirmedSlotIndex + 1}`;
    default:
      return '-';
  }
};

// eslint-disable-next-line complexity
export const OrderDetail = ({
  orderid,
  destination,
  setRefresh,
}: {
  orderid: string;
  destination: CrossChainDestination;
  setRefresh: (fn: () => void) => void;
}) => {
  const { network } = useApi();
  const { t } = useTranslation();

  const {
    loading: orderDetailLoading,
    transformedData: orderDetailState,
    refetch,
  } = usePollIntervalQuery<OrderDetailData, { orderId: string }, OrderDetailState | undefined>(
    ORDER_DETAIL,
    {
      variables: { orderId: `${destination}-${orderid}` },
    },
    transformOrderDetail
  );

  useEffect(() => {
    setRefresh(() => () => {
      console.log('refresh');
      refetch();
    });
  }, [setRefresh, refetch]);

  return (
    <>
      <Breadcrumb separator=">">
        <Breadcrumb.Item>
          <NavLink to={`${Path.feemarket}?tab=orders`}>{t('Orders')}</NavLink>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{orderid}</Breadcrumb.Item>
      </Breadcrumb>

      <Card className="mt-1">
        <Spin spinning={orderDetailLoading}>
          <Descriptions column={1} title={<span className="text-sm font-bold text-black">{t('Detail')}</span>}>
            <Descriptions.Item label={t('Nonce')}>{orderid}</Descriptions.Item>
            <Descriptions.Item label={t('Lane ID')}>{orderDetailState?.createLaneId || '-'}</Descriptions.Item>
            <Descriptions.Item label={t('Source TxID')}>
              {orderDetailState?.sourceTxHash ? (
                <SubscanLink network={network.name} txHash={orderDetailState.sourceTxHash} />
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t('Sender')}>
              {orderDetailState?.sender ? (
                <SubscanLink copyable address={orderDetailState.sender} network={network.name} />
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t('Status')}>
              {orderDetailState?.status === SubqlOrderStatus.FINISHED ? (
                <Badge status="success" text={t(OrderStatus.FINISHED)} />
              ) : orderDetailState?.status === SubqlOrderStatus.OUT_OF_SLOT ? (
                <Badge status="warning" text={t(OrderStatus.OUT_OF_SLOT)} />
              ) : (
                <Badge status="processing" text={t(OrderStatus.IN_PROGRESS)} />
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t('Cross-chain Fee')}>
              {orderDetailState?.fee
                ? `${fromWei({ value: orderDetailState.fee }, prettyNumber)} ${network.tokens.ring.symbol}`
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('Finished at Slot')}>
              {t(getPrioritySlot(orderDetailState?.confirmedSlotIndex))}&nbsp;(within {orderDetailState?.slotTime}{' '}
              blocks)
            </Descriptions.Item>
            <Descriptions.Item label={t('Out of Slots Block Number')}>
              {orderDetailState?.outOfSlot || '-'}
            </Descriptions.Item>
          </Descriptions>

          <Descriptions column={1}>
            <Descriptions.Item label={t('Created Block')}>
              {orderDetailState?.createBlock ? (
                <SubscanLink network={network.name} block={orderDetailState.createBlock.toString()} prefix="#" />
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t('Confirmed Block')}>
              {orderDetailState?.finishBlock ? (
                <SubscanLink network={network.name} block={orderDetailState.finishBlock.toString()} prefix="#" />
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t('Created Time')}>
              {orderDetailState?.createTime
                ? `${formatDistance(new Date(orderDetailState.createTime), new Date(), { addSuffix: true })} ( ${format(
                    new Date(orderDetailState.createTime),
                    DATE_TIME_FORMATE
                  )} +UTC)`
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('Confirmed Time')}>
              {orderDetailState?.finishTime
                ? `${formatDistance(new Date(orderDetailState.finishTime), new Date(), { addSuffix: true })} ( ${format(
                    new Date(orderDetailState.finishTime),
                    DATE_TIME_FORMATE
                  )} +UTC)`
                : '-'}
            </Descriptions.Item>
          </Descriptions>

          {orderDetailState?.rewards.length ? (
            <>
              <Divider className="my-2" />
              <Descriptions column={1} title={<span className="text-sm font-bold text-black">{t('Reward')}</span>}>
                <Descriptions.Item label={t('Reward Extrinsic')}>
                  <SubscanLink
                    network={network.name}
                    extrinsic={{
                      height: orderDetailState.rewards[0].rewardBlock,
                      index: orderDetailState.rewards[0].rewardExtrinsic,
                    }}
                  />
                </Descriptions.Item>
                {orderDetailState.rewards[0].assignedRelayerId && (
                  <Descriptions.Item label={t(RelayerRole.ASSIGNED)}>
                    <AccountName account={orderDetailState.rewards[0].assignedRelayerId.split('-')[1]} />
                    <span>
                      &nbsp;
                      {`| ${fromWei({ value: orderDetailState.rewards[0].assignedAmount }, prettyNumber)} ${
                        network.tokens.ring.symbol
                      }`}
                    </span>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label={t(RelayerRole.DELIVERY)}>
                  <AccountName account={orderDetailState.rewards[0].deliveredRelayerId.split('-')[1]} />
                  <span>
                    &nbsp;
                    {`| ${fromWei({ value: orderDetailState.rewards[0].deliveredAmount }, prettyNumber)} ${
                      network.tokens.ring.symbol
                    }`}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label={t(RelayerRole.CONFIRMED)}>
                  <AccountName account={orderDetailState.rewards[0].confirmedRelayerId.split('-')[1]} />
                  <span>
                    &nbsp;
                    {`| ${fromWei({ value: orderDetailState.rewards[0].confirmedAmount }, prettyNumber)} ${
                      network.tokens.ring.symbol
                    }`}
                  </span>
                </Descriptions.Item>
                {orderDetailState.rewards[0].treasuryAmount && (
                  <Descriptions.Item label={t('Treaury')}>{`${fromWei(
                    { value: orderDetailState.rewards[0].treasuryAmount },
                    prettyNumber
                  )} ${network.tokens.ring.symbol}`}</Descriptions.Item>
                )}
              </Descriptions>
            </>
          ) : null}

          {orderDetailState?.slashs.length ? (
            <>
              <Divider className="my-2" />
              <Descriptions column={1} title={<span className="text-sm font-bold text-black">{t('Slash')}</span>}>
                <Descriptions.Item label={t('Delay Blocks')}>{orderDetailState.slashs[0].delayTime}</Descriptions.Item>
                <Descriptions.Item label={t('Slash Extrinsic')}>
                  <SubscanLink
                    network={network.name}
                    extrinsic={{
                      height: orderDetailState.slashs[0].slashBlock,
                      index: orderDetailState.slashs[0].slashExtrinsic,
                    }}
                  />
                </Descriptions.Item>
                {orderDetailState.slashs.map((slash) => (
                  <Descriptions.Item label={t(RelayerRole.ASSIGNED)} key={slash.relayerId}>
                    <AccountName account={slash.relayerId.split('-')[1]} />
                    <span>
                      &nbsp;{`| -${fromWei({ value: slash.amount }, prettyNumber)} ${network.tokens.ring.symbol}`}
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
