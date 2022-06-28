import { useContext } from 'react';
import { FeeMarketContext, FeeMarketCtx } from '../providers';

export const useFeeMarket = () => useContext(FeeMarketContext) as Exclude<FeeMarketCtx, null>;
