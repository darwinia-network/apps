import { gql } from '@apollo/client';

export const FEE_MARKET_OVERVIEW = gql`
  query feeMarketOverview($destination: String!) {
    market(id: $destination) {
      averageSpeed
      totalReward
      finishedOrders
      inProgressInSlotOrders
      inProgressOutOfSlotOrders
    }
  }
`;

export const TOTAL_ORDERS_OVERVIEW = gql`
  query totalOrdersOverview($destination: String!) {
    orders(filter: { id: { startsWith: $destination } }, orderBy: CREATE_BLOCK_TIME_ASC) {
      nodes {
        createBlockTime
      }
    }
  }
`;

export const MARKET_FEE_OVERVIEW = gql`
  query marketFeeOverview($destination: String!, $offset: Int!) {
    marketFees(filter: { id: { startsWith: $destination } }, orderBy: TIMESTAMP_ASC, first: 100, offset: $offset) {
      totalCount
      pageInfo {
        hasNextPage
      }
      nodes {
        fee
        timestamp
      }
    }
  }
`;

export const RELAYER_OVERVIEW = gql`
  query relayerOverview($relayerId: String!) {
    relayer(id: $relayerId) {
      totalOrders
      totalSlashs
      totalRewards
    }
  }
`;

export const ORDERS_STATISTICS = gql`
  query ordersStatistics($destination: String!) {
    market(id: $destination) {
      finishedOrders
      inProgressInSlotOrders
      inProgressOutOfSlotOrders
    }
  }
`;

export const ORDERS_OVERVIEW = gql`
  query ordersOverview($destination: String!) {
    orders(filter: { id: { startsWith: $destination } }, orderBy: CREATE_EVENT_INDEX_DESC) {
      nodes {
        id
        sender
        deliveredRelayersId
        confirmedRelayersId
        createBlockNumber
        finishBlockNumber
        createBlockTime
        finishBlockTime
        status
        confirmedSlotIndex
      }
    }
  }
`;

export const ORDER_DETAIL = gql`
  query orderDetail($orderId: String!) {
    order(id: $orderId) {
      id
      fee
      sender
      sourceTxHash
      slotTime
      outOfSlotBlock
      confirmedSlotIndex
      status
      createBlockTime
      finishBlockTime
      createBlockNumber
      finishBlockNumber
      assignedRelayersId
      slashs(orderBy: BLOCK_NUMBER_ASC) {
        nodes {
          amount
          relayerId
          delayTime
          blockNumber
          extrinsicIndex
        }
      }
      rewards(orderBy: BLOCK_NUMBER_ASC) {
        nodes {
          blockTime
          blockNumber
          extrinsicIndex
          assignedRelayersId
          deliveredRelayersId
          confirmedRelayersId
          assignedAmounts
          deliveredAmounts
          confirmedAmounts
          treasuryAmount
        }
      }
    }
  }
`;

export const RELAYER_REWARD_SLASH = gql`
  query relayerRewardSlash($relayerId: String!) {
    relayer(id: $relayerId) {
      slashs(orderBy: BLOCK_NUMBER_ASC) {
        nodes {
          amount
          blockTime
        }
      }
      assignedRelayerRewardsId
      deliveredRelayerRewardsId
      confirmedRelayerRewardsId
    }
  }
`;

export const REWARD_SIMPLE = gql`
  query rewardSimple($rewardId: String!) {
    reward(id: $rewardId) {
      blockTime
      assignedAmounts
      deliveredAmounts
      confirmedAmounts
      assignedRelayersId
      deliveredRelayersId
      confirmedRelayersId
    }
  }
`;

export const RELAYER_QUOTES = gql`
  query relayerQuotes($relayerId: String!) {
    relayer(id: $relayerId) {
      quoteHistory(orderBy: BLOCK_NUMBER_ASC) {
        nodes {
          amount
          blockTime
        }
      }
    }
  }
`;

export const RELAYER_ORDERS = gql`
  query relayerOrders($relayerId: String!) {
    relayer(id: $relayerId) {
      id
      assignedRelayerOrdersId
      deliveredRelayerOrdersId
      confirmedRelayerOrdersId
      slashs {
        nodes {
          amount
          blockTime
          orderId
          order {
            createBlockTime
          }
        }
      }
    }
  }
`;

export const ORDER_SIMPLE = gql`
  query orderSimple($orderId: String!) {
    order(id: $orderId) {
      id
      createBlockTime
      slashs {
        nodes {
          amount
          relayerId
        }
      }
      rewards {
        nodes {
          assignedAmounts
          deliveredAmounts
          confirmedAmounts
          assignedRelayersId
          deliveredRelayersId
          confirmedRelayersId
        }
      }
    }
  }
`;
