import { gql } from '@apollo/client';

export const QUERY_FEEMARKET_RECORD = gql`
  query QueryFeeMarket($destination: String!) {
    feeMarketEntity(id: $destination) {
      averageSpeed
      totalRewards
      totalOrders
      totalFinished
      totalInProgress
    }
  }
`;

export const IN_PROGRESS_ORDERS_ASSIGNED_RELAYERS = gql`
  query QueryInProgressOrders($destination: String!) {
    orderEntities(filter: { and: [{ id: { startsWith: $destination } }, { phase: { equalTo: Created } }] }) {
      nodes {
        assignedRelayers
      }
    }
  }
`;

export const TOTAL_ORDERS_AND_FEE_HISTORY = gql`
  query QueryOverviewOrders($destination: String!, $date: Datetime!) {
    orderEntities(
      filter: { and: [{ id: { startsWith: $destination } }, { createTime: { greaterThan: $date } }] }
      orderBy: CREATE_TIME_ASC
    ) {
      nodes {
        fee
        createTime
      }
    }
  }
`;

export const QUERY_RELAYER = gql`
  query QueryRelayer($relayer: String!) {
    relayerEntity(id: $relayer) {
      totalOrders
      totalSlashs
      totalRewards
    }
  }
`;

export const RELAYER_DETAIL = gql`
  query RelayerDetail($relayer: String!, $feeDate: Datetime!, $slashDate: Datetime!, $rewardDate: Datetime!) {
    relayerEntity(id: $relayer) {
      feeHistory(filter: { newfeeTime: { greaterThan: $feeDate } }, orderBy: NEWFEE_TIME_ASC) {
        nodes {
          fee
          newfeeTime
        }
      }
      slashs(filter: { slashTime: { greaterThan: $slashDate } }, orderBy: SLASH_TIME_ASC) {
        nodes {
          amount
          slashTime
        }
      }
      assignedRewards(filter: { rewardTime: { greaterThan: $rewardDate } }) {
        nodes {
          rewardTime
          assignedAmount
        }
      }
      deliveredRewards(filter: { rewardTime: { greaterThan: $rewardDate } }) {
        nodes {
          rewardTime
          deliveredAmount
        }
      }
      confirmedRewards(filter: { rewardTime: { greaterThan: $rewardDate } }) {
        nodes {
          rewardTime
          confirmedAmount
        }
      }

      assignedOrders {
        nodes {
          id
          assignedRelayerId
          deliveredRelayerId
          confirmedRelayerId
          confirmedSlotIndex
          createBlock
          finishBlock
          finishTime
          assignedRelayers
          rewards {
            nodes {
              assignedAmount
              deliveredAmount
              confirmedAmount
              assignedRelayerId
              deliveredRelayerId
              confirmedRelayerId
            }
          }
          slashs {
            nodes {
              amount
              relayerId
            }
          }
        }
      }
      deliveredOrders {
        nodes {
          id
          assignedRelayerId
          deliveredRelayerId
          confirmedRelayerId
          confirmedSlotIndex
          createBlock
          finishBlock
          finishTime
          assignedRelayers
          rewards {
            nodes {
              assignedAmount
              deliveredAmount
              confirmedAmount
              assignedRelayerId
              deliveredRelayerId
              confirmedRelayerId
            }
          }
          slashs {
            nodes {
              amount
              relayerId
            }
          }
        }
      }
      confirmedOrders {
        nodes {
          id
          assignedRelayerId
          deliveredRelayerId
          confirmedRelayerId
          confirmedSlotIndex
          createBlock
          finishBlock
          finishTime
          assignedRelayers
          rewards {
            nodes {
              assignedAmount
              deliveredAmount
              confirmedAmount
              assignedRelayerId
              deliveredRelayerId
              confirmedRelayerId
            }
          }
          slashs {
            nodes {
              amount
              relayerId
            }
          }
        }
      }
    }
  }
`;

export const ORDERS_STATISTICS = gql`
  query OrdersStatistics($destination: String!) {
    feeMarketEntity(id: $destination) {
      totalFinished
      totalInProgress
      totalOutOfSlot
    }
  }
`;

export const ORDERS_TOTAL_ORDERS = gql`
  query OrdersTotalOrders($destination: String!) {
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
        confirmedSlotIndex
      }
    }
  }
`;

export const ORDER_DETAIL = gql`
  query OrderDetail($orderid: String!) {
    orderEntity(id: $orderid) {
      id
      fee
      sender
      sourceTxHash
      confirmedSlotIndex
      createTime
      finishTime
      createBlock
      finishBlock
      createLaneId
      slashs(orderBy: SLASH_TIME_ASC) {
        nodes {
          confirmTime
          sentTime
          delayTime
          amount
          relayerId
        }
      }
      rewards(orderBy: REWARD_TIME_ASC) {
        nodes {
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
