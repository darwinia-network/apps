import { Card, Descriptions, Badge, Breadcrumb, Spin } from 'antd';
import { NavLink } from 'react-router-dom';
import { formatDistance, format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { capitalize } from 'lodash';

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
      return SlotState.SLOT_1;
    case 1:
      return SlotState.SLOT_2;
    case 2: // eslint-disable-line no-magic-numbers
      return SlotState.SLOT_3;
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
            <Descriptions.Item label={t('Time Stamp')}>
              {orderDetailState?.createTime
                ? `${capitalize(
                    formatDistance(new Date(`${orderDetailState.createTime}Z`), Date.now(), {
                      addSuffix: true,
                    })
                  )} ( ${format(new Date(orderDetailState.createTime), DATE_TIME_FORMATE)} +UTC)`
                : '-'}
            </Descriptions.Item>
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
            <Descriptions.Item label={t('Fee')}>
              {orderDetailState?.fee
                ? `${fromWei({ value: orderDetailState.fee }, prettyNumber)} ${network.tokens.ring.symbol}`
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('Created At')}>
              {orderDetailState?.createBlock ? (
                <SubscanLink network={network.name} block={orderDetailState.createBlock.toString()} prefix="#" />
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t('Confirmed At')}>
              {orderDetailState?.finishBlock ? (
                <SubscanLink network={network.name} block={orderDetailState.finishBlock.toString()} prefix="#" />
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t('Slot At')}>
              {t(getPrioritySlot(orderDetailState?.confirmedSlotIndex))}
            </Descriptions.Item>
            <Descriptions.Item label={t('Assigned Relayers')}>
              <div className="inline-flex items-center space-x-4">
                {orderDetailState?.assignedRelayers.map((relayer) => (
                  <AccountName key={relayer} account={relayer} copyable />
                ))}
              </div>
            </Descriptions.Item>
          </Descriptions>

          {orderDetailState?.rewards.length ? (
            <>
              <Descriptions
                column={1}
                className="mt-4"
                title={<span className="text-sm font-bold text-black">{t('Reward')}</span>}
              >
                <Descriptions.Item label={t('Extrinsic')}>
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
                    <AccountName account={orderDetailState.rewards[0].assignedRelayerId.split('-')[1]} copyable />
                    <span>
                      &nbsp;
                      {`| +${fromWei({ value: orderDetailState.rewards[0].assignedAmount }, prettyNumber)} ${
                        network.tokens.ring.symbol
                      }`}
                    </span>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label={t(RelayerRole.DELIVERY)}>
                  <AccountName account={orderDetailState.rewards[0].deliveredRelayerId.split('-')[1]} copyable />
                  <span>
                    &nbsp;
                    {`| +${fromWei({ value: orderDetailState.rewards[0].deliveredAmount }, prettyNumber)} ${
                      network.tokens.ring.symbol
                    }`}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label={t(RelayerRole.CONFIRMATION)}>
                  <AccountName account={orderDetailState.rewards[0].confirmedRelayerId.split('-')[1]} copyable />
                  <span>
                    &nbsp;
                    {`| +${fromWei({ value: orderDetailState.rewards[0].confirmedAmount }, prettyNumber)} ${
                      network.tokens.ring.symbol
                    }`}
                  </span>
                </Descriptions.Item>
                {orderDetailState.rewards[0].treasuryAmount && (
                  <Descriptions.Item label={t('Treaury')}>{`+${fromWei(
                    { value: orderDetailState.rewards[0].treasuryAmount },
                    prettyNumber
                  )} ${network.tokens.ring.symbol}`}</Descriptions.Item>
                )}
              </Descriptions>
            </>
          ) : null}

          {orderDetailState?.slashs.length ? (
            <>
              <Descriptions column={1} title={<span className="text-sm font-bold text-black">{t('Slash')}</span>}>
                <Descriptions.Item label={t('Extrinsic')}>
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
                    <AccountName account={slash.relayerId.split('-')[1]} copyable />
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
