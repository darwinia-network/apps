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

export const OVERVIEW_FOR_CHART = gql`
  query QueryOverviewOrders($destination: String!, $date: Datetime!) {
    orderEntities(
      filter: { and: [{ id: { startsWith: $destination } }, { createTime: { greaterThan: $date } }] }
      orderBy: CREATE_TIME_ASC
    ) {
      totalCount
      nodes {
        fee
        createTime
      }
    }
  }
`;
