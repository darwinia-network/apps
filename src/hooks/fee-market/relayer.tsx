import type { Option, Vec } from '@polkadot/types';
import { useState, useEffect } from 'react';
import { from } from 'rxjs';
import type { AccountId32 } from '@polkadot/types/interfaces';
import type { PalletFeeMarketRelayer } from '../../model';
import { useFeeMarket } from '../feemarket';
import { getFeeMarketModule } from '../../utils';
import { useApi } from '../api';

export const useTotalRelayers = () => {
  const { api } = useApi();
  const { destination } = useFeeMarket();

  const [totalRelayers, setTotalRelayers] = useState<AccountId32[]>([]);

  useEffect(() => {
    const sub$$ = from(api.query[getFeeMarketModule(destination)].relayers<Vec<AccountId32>>()).subscribe(
      setTotalRelayers
    );

    return () => sub$$.unsubscribe();
  }, [api, destination]);

  return { totalRelayers };
};

export const useAssignedRelayers = () => {
  const { api } = useApi();
  const { destination } = useFeeMarket();

  const [assignedRelayers, setAssignedRelayers] = useState<PalletFeeMarketRelayer[]>([]);

  useEffect(() => {
    const sub$$ = from(
      api.query[getFeeMarketModule(destination)].assignedRelayers<Option<Vec<PalletFeeMarketRelayer>>>()
    ).subscribe((res) => {
      if (res.isSome) {
        setAssignedRelayers(res.unwrap());
      }
    });

    return () => sub$$.unsubscribe();
  }, [api, destination]);

  return { assignedRelayers };
};
