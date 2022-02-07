import { useContext } from 'react';
import { StakingContext, StakingCtx } from '../../providers/staking';

export const useStaking = () => useContext(StakingContext) as Exclude<StakingCtx, null>;
