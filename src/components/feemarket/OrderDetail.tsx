import { Card, Descriptions, Badge, Breadcrumb, Spin } from 'antd';
import { NavLink, useLocation } from 'react-router-dom';
import { formatDistance, format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { capitalize } from 'lodash';
import { isArray } from '@polkadot/util';

import { ORDER_DETAIL, DATE_TIME_FORMATE } from '../../config';
import { DarwiniaChain, SlotState, RelayerRole, TOrderDetail, FeeMarketTab, OrderStatus } from '../../model';
import { useApi, useCustomQuery } from '../../hooks';
import { SubscanLink } from '../widget/SubscanLink';
import { fromWei, prettyNumber } from '../../utils';
import { AccountName } from '../widget/account/AccountName';

const getSlotText = (confirmedSlotIndex?: number | null): string => {
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

const renderRelayersReward = ({
  label,
  relayersId,
  amounts,
}: {
  label: string;
  relayersId?: string[] | null;
  amounts?: string[] | string | null;
}) =>
  relayersId?.length && amounts?.length
    ? relayersId.map((relayerId, index) => {
        const { network } = useApi();
        const amount = isArray(amounts) ? amounts[index] : (amounts || '').split(',')[index];

        return (
          <Descriptions.Item label={label} key={index}>
            <AccountName account={relayerId.split('-')[1]} copyable />
            <span>
              &nbsp;
              {`| +${fromWei({ value: amount }, prettyNumber)} ${network.tokens.ring.symbol}`}
            </span>
          </Descriptions.Item>
        );
      })
    : null;

// eslint-disable-next-line complexity
export const OrderDetail = ({
  lane,
  nonce,
  destination,
  setRefresh,
}: {
  lane: string;
  nonce: number;
  destination: DarwiniaChain;
  setRefresh: (fn: () => void) => void;
}) => {
  const { network } = useApi();
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const {
    loading: orderDetailLoading,
    data: orderDetailData,
    refetch: refetchOrderDetail,
  } = useCustomQuery<TOrderDetail, { orderId: string }>(ORDER_DETAIL, {
    variables: { orderId: `${destination}-${lane}-${nonce}` },
  });

  useEffect(() => {
    setRefresh(() => () => {
      refetchOrderDetail();
    });
  }, [setRefresh, refetchOrderDetail]);

  return (
    <>
      <Breadcrumb separator=">">
        <Breadcrumb.Item>
          <NavLink to={`${pathname}?tab=${FeeMarketTab.OREDERS}`}>{t('Orders')}</NavLink>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{nonce}</Breadcrumb.Item>
      </Breadcrumb>

      <Card className="mt-1">
        <Spin spinning={orderDetailLoading}>
          <Descriptions column={1} title={<span className="text-sm font-bold text-black">{t('Detail')}</span>}>
            <Descriptions.Item label={t('Nonce')}>{nonce}</Descriptions.Item>
            <Descriptions.Item label={t('Lane ID')}>{lane}</Descriptions.Item>
            <Descriptions.Item label={t('Time Stamp')}>
              {orderDetailData?.order?.createBlockTime
                ? `${capitalize(
                    formatDistance(new Date(`${orderDetailData.order.createBlockTime}Z`), Date.now(), {
                      addSuffix: true,
                    })
                  )} ( ${format(new Date(`${orderDetailData.order.createBlockTime}Z`), DATE_TIME_FORMATE)} +UTC)`
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('Source TxID')}>
              {orderDetailData?.order?.sourceTxHash ? (
                <SubscanLink network={network.name} txHash={orderDetailData.order.sourceTxHash} />
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t('Sender')}>
              {orderDetailData?.order?.sender ? (
                <SubscanLink copyable address={orderDetailData.order.sender} network={network.name} />
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t('Status')}>
              {orderDetailData?.order?.status === OrderStatus.FINISHED ? (
                <Badge status="success" text={t('Finished')} />
              ) : (
                <Badge status="processing" text={t('In Progress')} />
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t('Fee')}>
              {orderDetailData?.order?.fee
                ? `${fromWei({ value: orderDetailData.order.fee }, prettyNumber)} ${network.tokens.ring.symbol}`
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('Created At')}>
              {orderDetailData?.order?.createBlockNumber ? (
                <SubscanLink
                  network={network.name}
                  block={orderDetailData.order.createBlockNumber.toString()}
                  prefix="#"
                />
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t('Confirmed At')}>
              {orderDetailData?.order?.finishBlockNumber ? (
                <SubscanLink
                  network={network.name}
                  block={orderDetailData.order.finishBlockNumber.toString()}
                  prefix="#"
                />
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t('Slot At')}>
              {t(getSlotText(orderDetailData?.order?.confirmedSlotIndex))}
            </Descriptions.Item>
            <Descriptions.Item label={t('Assigned Relayers')}>
              <div className="inline-flex items-center space-x-4">
                {orderDetailData?.order?.assignedRelayersId.map((relayerId) => (
                  <AccountName key={relayerId} account={relayerId.split('-')[1]} copyable />
                ))}
              </div>
            </Descriptions.Item>
          </Descriptions>

          {orderDetailData?.order?.rewards?.nodes.length ? (
            <>
              <Descriptions
                column={1}
                className="mt-4"
                title={<span className="text-sm font-bold text-black">{t('Reward')}</span>}
              >
                {orderDetailData.order.rewards.nodes[0].extrinsicIndex && (
                  <Descriptions.Item label={t('Extrinsic')}>
                    <SubscanLink
                      network={network.name}
                      extrinsic={{
                        height: orderDetailData.order.rewards.nodes[0].blockNumber,
                        index: orderDetailData.order.rewards.nodes[0].extrinsicIndex,
                      }}
                    />
                  </Descriptions.Item>
                )}
                {renderRelayersReward({
                  label: t(RelayerRole.ASSIGNED),
                  amounts: orderDetailData.order.rewards.nodes[0].assignedAmounts,
                  relayersId: orderDetailData.order.rewards.nodes[0].assignedRelayersId,
                })}
                {renderRelayersReward({
                  label: t(RelayerRole.DELIVERY),
                  amounts: orderDetailData.order.rewards.nodes[0].deliveredAmounts,
                  relayersId: orderDetailData.order.rewards.nodes[0].deliveredRelayersId,
                })}
                {renderRelayersReward({
                  label: t(RelayerRole.CONFIRMATION),
                  amounts: orderDetailData.order.rewards.nodes[0].confirmedAmounts,
                  relayersId: orderDetailData.order.rewards.nodes[0].confirmedRelayersId,
                })}
                {orderDetailData.order.rewards.nodes[0].treasuryAmount && (
                  <Descriptions.Item label={t('Treaury')}>{`+${fromWei(
                    { value: orderDetailData.order.rewards.nodes[0].treasuryAmount },
                    prettyNumber
                  )} ${network.tokens.ring.symbol}`}</Descriptions.Item>
                )}
              </Descriptions>
            </>
          ) : null}

          {orderDetailData?.order?.slashs?.nodes.length ? (
            <>
              <Descriptions column={1} title={<span className="text-sm font-bold text-black">{t('Slash')}</span>}>
                {orderDetailData.order.slashs.nodes[0].extrinsicIndex && (
                  <Descriptions.Item label={t('Extrinsic')}>
                    <SubscanLink
                      network={network.name}
                      extrinsic={{
                        height: orderDetailData.order.slashs.nodes[0].blockNumber,
                        index: orderDetailData.order.slashs.nodes[0].extrinsicIndex,
                      }}
                    />
                  </Descriptions.Item>
                )}
                {orderDetailData.order.slashs.nodes.map((slash, index) => (
                  <Descriptions.Item label={t(RelayerRole.ASSIGNED)} key={index}>
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
