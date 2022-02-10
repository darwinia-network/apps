import { useContext } from 'react';
import { MetamaskContext, MetamaskCtx } from '../providers/metamask';

export const useMetamask = () => useContext(MetamaskContext) as Exclude<MetamaskCtx, null>;
