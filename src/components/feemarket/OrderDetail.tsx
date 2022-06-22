import { Card, Descriptions, Badge, Divider, Breadcrumb, Spin } from 'antd';
import { NavLink } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { formatDistance } from 'date-fns';

import { Path } from '../../config/routes';
import { ORDER_DETAIL, LONG_LONG_DURATION } from '../../config';
import type { OrderDetailData } from '../../model';
import { useFeeMarket, useApi } from '../../hooks';
import { SubscanLink } from '../widget/SubscanLink';
import { fromWei, prettyNumber } from '../../utils';
import { AccountName } from '../widget/account/AccountName';

// eslint-disable-next-line complexity
export const OrderDetail = ({ orderid }: { orderid: string }) => {
  const { network } = useApi();
  const { destination } = useFeeMarket();
  const { loading, data } = useQuery(ORDER_DETAIL, {
    variables: { orderid: `${destination}-${orderid}` },
    pollInterval: LONG_LONG_DURATION,
    notifyOnNetworkStatusChange: true,
  }) as { loading: boolean; data: OrderDetailData | null };

  return (
    <>
      <Breadcrumb separator=">">
        <Breadcrumb.Item>
          <NavLink to={`${Path.feemarket}?tab=orders`}>Orders</NavLink>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{orderid}</Breadcrumb.Item>
      </Breadcrumb>

      <Card className="mt-1">
        <Spin spinning={loading}>
          <Descriptions column={1}>
            <Descriptions.Item label="Nonce">{orderid || '-'}</Descriptions.Item>
            <Descriptions.Item label="Lane ID">{data?.orderEntity?.createLaneId || '-'}</Descriptions.Item>
            <Descriptions.Item label="Source TxID">
              {data?.orderEntity?.sourceTxHash ? (
                <SubscanLink network={network.name} txHash={data.orderEntity.sourceTxHash} />
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Sender">{data?.orderEntity?.sender || '-'}</Descriptions.Item>
            <Descriptions.Item label="State">
              {data?.orderEntity?.confirmedSlotIndex === undefined ? (
                <Badge status="processing" text="Cross-chain in progress" />
              ) : data.orderEntity.confirmedSlotIndex === -1 ? (
                <Badge status="warning" text="Cross-chain out of slot" />
              ) : (
                <Badge status="success" text="Cross-chain success" />
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Cross-chain Fee:">
              {data?.orderEntity?.fee
                ? `${fromWei({ value: data.orderEntity.fee }, prettyNumber)} ${network.tokens.ring.symbol}`
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Priority Slot">
              {data?.orderEntity?.confirmedSlotIndex === undefined
                ? '-'
                : data.orderEntity.confirmedSlotIndex === -1
                ? 'Out of slot'
                : `#${data.orderEntity.confirmedSlotIndex + 1}`}
            </Descriptions.Item>
          </Descriptions>

          <Divider className="my-2" />

          <Descriptions column={1} title="Time:">
            <Descriptions.Item label="Start Block">
              {data?.orderEntity?.createBlock ? `#${data.orderEntity.createBlock}` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="End Block">
              {data?.orderEntity?.finishBlock ? `#${data.orderEntity.finishBlock}` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Start Time">
              {data?.orderEntity?.createTime
                ? `${formatDistance(new Date(data.orderEntity.createTime), new Date())} ( ${
                    data.orderEntity.createTime
                  } )`
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="End Time">
              {data?.orderEntity?.finishTime
                ? `${formatDistance(new Date(data.orderEntity.finishTime), new Date())} ( ${
                    data.orderEntity.finishTime
                  } )`
                : '-'}
            </Descriptions.Item>
          </Descriptions>

          {data?.orderEntity?.rewards.nodes.length ? (
            <>
              <Divider className="my-2" />
              <Descriptions column={1} title="Rewards:">
                {data.orderEntity.rewards.nodes[0].assignedRelayerId && (
                  <Descriptions.Item label="Assigned Relayer">
                    <AccountName account={data.orderEntity.rewards.nodes[0].assignedRelayerId.split('-')[1]} />
                    <span>
                      &nbsp;
                      {`| ${fromWei({ value: data.orderEntity.rewards.nodes[0].assignedAmount }, prettyNumber)} ${
                        network.tokens.ring.symbol
                      }`}
                    </span>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Delivery Relayer">
                  <AccountName account={data.orderEntity.rewards.nodes[0].deliveredRelayerId.split('-')[1]} />
                  <span>
                    &nbsp;
                    {`| ${fromWei({ value: data.orderEntity.rewards.nodes[0].deliveredAmount }, prettyNumber)} ${
                      network.tokens.ring.symbol
                    }`}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Confirm Relayer">
                  <AccountName account={data.orderEntity.rewards.nodes[0].confirmedRelayerId.split('-')[1]} />
                  <span>
                    &nbsp;
                    {`| ${fromWei({ value: data.orderEntity.rewards.nodes[0].confirmedAmount }, prettyNumber)} ${
                      network.tokens.ring.symbol
                    }`}
                  </span>
                </Descriptions.Item>
                {data.orderEntity.rewards.nodes[0].treasuryAmount && (
                  <Descriptions.Item label="To Treaury">{`${fromWei(
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
              <Descriptions column={1} title="Slashs:">
                <Descriptions.Item label="Sent Block">#{data.orderEntity.slashs.nodes[0].sentTime}</Descriptions.Item>
                <Descriptions.Item label="Confirm Block">
                  #{data.orderEntity.slashs.nodes[0].confirmTime}
                </Descriptions.Item>
                <Descriptions.Item label="Delay Block">#{data.orderEntity.slashs.nodes[0].delayTime}</Descriptions.Item>
                {data?.orderEntity?.slashs.nodes.map((node) => (
                  <Descriptions.Item label="Assigned Relayer" key={node.relayerId}>
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
