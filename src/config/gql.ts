import { gql } from '@apollo/client';

export const OVERVIEW_STATISTICS = gql`
  query overviewStatistics($destination: String!) {
    feeMarketEntity(id: $destination) {
      averageSpeed
      totalRewards
      totalOrders
    }
  }
`;

export const FEE_MARKET_FEE_AND_ORDER_HISTORY = gql`
  query feeMarketFeeHistory($destination: String!, $time: Datetime!) {
    orderEntities(
      filter: { and: [{ id: { startsWith: $destination } }, { createTime: { greaterThan: $time } }] }
      orderBy: CREATE_TIME_ASC
    ) {
      nodes {
        fee
        createTime
      }
    }
  }
`;

export const RELAYER_TOTAL_ORDERS_SLASHS_REWARDS = gql`
  query relayerTotalOrdersSlashsRewards($relayer: String!) {
    relayerEntity(id: $relayer) {
      totalOrders
      totalSlashs
      totalRewards
    }
  }
`;

export const RELAYER_REWARDS_AND_SLASHS = gql`
  query relayerRewardsAndSlashs($relayer: String!, $time: Datetime!) {
    relayerEntity(id: $relayer) {
      assignedRewards(filter: { rewardTime: { greaterThan: $time } }) {
        nodes {
          rewardTime
          assignedAmount
        }
      }
      deliveredRewards(filter: { rewardTime: { greaterThan: $time } }) {
        nodes {
          rewardTime
          deliveredAmount
        }
      }
      confirmedRewards(filter: { rewardTime: { greaterThan: $time } }) {
        nodes {
          rewardTime
          confirmedAmount
        }
      }
      slashs(filter: { slashTime: { greaterThan: $time } }) {
        nodes {
          amount
          slashTime
        }
      }
    }
  }
`;

export const RELAYER_FEE_HISTORY = gql`
  query relayerFeeHistory($relayer: String!, $time: Datetime!) {
    relayerEntity(id: $relayer) {
      feeHistory(filter: { newfeeTime: { greaterThan: $time } }, orderBy: NEWFEE_TIME_ASC) {
        nodes {
          fee
          newfeeTime
        }
      }
    }
  }
`;

export const RELAYER_ORDERS = gql`
  query relayerOrders($relayer: String!) {
    relayerEntity(id: $relayer) {
      assignedOrders {
        nodes {
          id
          createTime
          rewards(filter: { assignedRelayerId: { equalTo: $relayer } }) {
            nodes {
              assignedAmount
            }
          }
        }
      }
      deliveredOrders {
        nodes {
          id
          createTime
          rewards(filter: { deliveredRelayerId: { equalTo: $relayer } }) {
            nodes {
              deliveredAmount
            }
          }
        }
      }
      confirmedOrders {
        nodes {
          id
          createTime
          rewards(filter: { confirmedRelayerId: { equalTo: $relayer } }) {
            nodes {
              confirmedAmount
            }
          }
        }
      }
      slashs {
        nodes {
          amount
          order {
            id
            createTime
          }
        }
      }
    }
  }
`;

export const ORDERS_STATISTICS = gql`
  query ordersStatistics($destination: String!) {
    feeMarketEntity(id: $destination) {
      totalFinished
      totalInProgress
      totalOutOfSlot
    }
  }
`;

export const FEE_MARKET_ORDERS = gql`
  query feeMarketOrders($destination: String!) {
    orderEntities(filter: { id: { startsWith: $destination } }, orderBy: CREATE_TIME_DESC) {
      nodes {
        id
        sender
        assignedRelayerId
        deliveredRelayerId
        confirmedRelayerId
        createBlock
        finishBlock
        createTime
        finishTime
        status
        confirmedSlotIndex
      }
    }
  }
`;

export const ORDER_DETAIL = gql`
  query orderDetail($orderId: String!) {
    orderEntity(id: $orderId) {
      id
      fee
      sender
      sourceTxHash
      slotTime
      outOfSlot
      confirmedSlotIndex
      status
      createLaneId
      createTime
      finishTime
      createBlock
      finishBlock
      slashs(orderBy: SLASH_TIME_ASC) {
        nodes {
          amount
          relayerId
          delayTime
          slashBlock
          slashExtrinsic
        }
      }
      rewards(orderBy: REWARD_TIME_ASC) {
        nodes {
          rewardBlock
          rewardExtrinsic
          assignedRelayerId
          deliveredRelayerId
          confirmedRelayerId
          assignedAmount
          deliveredAmount
          confirmedAmount
          treasuryAmount
        }
      }
    }
  }
`;
