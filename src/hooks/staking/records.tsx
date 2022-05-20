import { useQuery } from '@apollo/client';
import { StakingRecordData, StakingRecordVars } from '../../model';
import { QUERY_STAKING_RECORDS } from '../../config';

export const useStakingRecords = ({ first, offset, account, types }: StakingRecordVars) => {
  const { loading, error, data, refetch } = useQuery<StakingRecordData, StakingRecordVars>(QUERY_STAKING_RECORDS, {
    variables: { first, offset, account, types },
    notifyOnNetworkStatusChange: true,
  });

  if (error) {
    console.error(error);
  }

  return { loading, data, refetch };
};
