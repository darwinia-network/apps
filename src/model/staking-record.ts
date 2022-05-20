export enum StakingType {
  Locked = 'Locked',
  Bonded = 'Bonded',
  Unbond = 'Unbond',
}

export type StakingRecord = {
  id: string;

  account: string;
  type: StakingType;
  tokenSymbol: string;

  amount: string;
  startTime: string;
  expireTime: string;

  blockTime: string;
  blockNumber: number;
  extrinsicIndex: number;

  isUnlockEarlier: boolean;
  earlierUnlockBlockTime: string;
  earlierUnlockBlockNumber: number;
  earlierUnlockExtrinsicIndex: number;
};

export type StakingRecordData = {
  stakingRecordEntities: {
    totalCount: number;
    pageInfo?: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    nodes: StakingRecord[];
  };
};

export type StakingRecordVars = {
  first: number;
  offset: number;
  account: string;
  types: StakingType[];
};
