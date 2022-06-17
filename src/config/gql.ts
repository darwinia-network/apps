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
