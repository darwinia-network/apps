import { gql } from '@apollo/client';

/* eslint-disable no-magic-numbers */
export const LONG_DURATION = 10 * 1000;

export const MIDDLE_DURATION = 6 * 1000;

export const SHORT_DURATION = 3 * 1000;

export const DATE_FORMAT = 'yyyy/MM/dd';

export const DATE_TIME_FORMATE = 'yyyy/MM/dd HH:mm:ss';

export const ETHEREUM_CLAIM_DEPOSIT = '0x649fdf6ee483a96e020b889571e93700fbd82d88';

export const STAKING_RECORD_PAGE_SIZE = 10;

// eslint-disable-next-line no-magic-numbers
export const DARWINIA_UNBONDING_PERIOD = 14 * 24 * 60 * 60 * 1000;

export const QUERY_STAKING_RECORDS = gql`
  query QueryStakingRecords($first: Int!, $offset: Int!, $account: String!, $types: [StakingType!]) {
    stakingRecordEntities(
      orderBy: BLOCK_TIME_DESC
      first: $first
      offset: $offset
      filter: { account: { equalTo: $account }, type: { in: $types } }
    ) {
      totalCount
      pageInfo {
        hasNextPage
      }
      nodes {
        id

        account
        type
        tokenSymbol

        amount
        startTime
        expireTime

        blockTime
        blockNumber
        extrinsicIndex

        isUnlockEarlier
        earlierUnlockBlockTime
        earlierUnlockBlockNumber
        earlierUnlockExtrinsicIndex
      }
    }
  }
`;
