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

export const QUERY_INPROGRESS_ORDERS = gql`
  query QueryInProgressOrders($destination: String!) {
    orderEntities(filter: { and: [{ id: { startsWith: $destination } }, { phase: { equalTo: Created } }] }) {
      nodes {
        assignedRelayers
      }
    }
  }
`;
