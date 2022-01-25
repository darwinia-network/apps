/* eslint-disable react-hooks/exhaustive-deps */
import { useContext } from 'react';
import { StakingAccountContext, StakingAccountCtx } from '../providers/staking';

export const useStakingAccount = () => useContext(StakingAccountContext) as Exclude<StakingAccountCtx, null>;
