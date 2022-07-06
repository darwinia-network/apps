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

export const RELAYER_TOTAL_ORDERS_SLASHS_REWARDS = gql`
  query RelayerTotalOrdersSlashsRewards($relayer: String!) {
    relayerEntity(id: $relayer) {
      totalOrders
      totalSlashs
      totalRewards
    }
  }
`;

export const RELAYER_REWARDS_AND_SLASHS = gql`
  query RelayerRewardsAndSlashs($relayer: String!, $lastTime: Datetime!) {
    relayerEntity(id: $relayer) {
      slashs(filter: { slashTime: { greaterThan: $lastTime } }, orderBy: SLASH_TIME_ASC) {
        nodes {
          amount
          slashTime
        }
      }
      assignedRewards(filter: { rewardTime: { greaterThan: $lastTime } }) {
        nodes {
          rewardTime
          assignedAmount
        }
      }
      deliveredRewards(filter: { rewardTime: { greaterThan: $lastTime } }) {
        nodes {
          rewardTime
          deliveredAmount
        }
      }
      confirmedRewards(filter: { rewardTime: { greaterThan: $lastTime } }) {
        nodes {
          rewardTime
          confirmedAmount
        }
      }
    }
  }
`;

export const RELAYER_FEE_HISTORY = gql`
  query RelayerFeeHistory($relayer: String!, $lastTime: Datetime!) {
    relayerEntity(id: $relayer) {
      feeHistory(filter: { newfeeTime: { greaterThan: $lastTime } }, orderBy: NEWFEE_TIME_ASC) {
        nodes {
          fee
          newfeeTime
        }
      }
    }
  }
`;

export const RELAYER_ORDERS = gql`
  query RelayerOrders($relayer: String!) {
    relayerEntity(id: $relayer) {
      slashs {
        nodes {
          amount
          order {
            id
            finishTime
          }
        }
      }
      assignedOrders {
        nodes {
          id
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
        }
      }
      deliveredOrders {
        nodes {
          id
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
        }
      }
      confirmedOrders {
        nodes {
          id
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
        status
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
      status
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
