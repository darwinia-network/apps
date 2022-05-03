import { KtonBalance, RingBalance } from '@darwinia/types';
import { BN } from '@polkadot/util';
import { useCallback, useEffect, useState } from 'react';
import { from, zip } from 'rxjs';
import { Asset, Fund } from '../../model';
import { assetToPower, getUnit, isKton, isRing, toWei } from '../../utils';
import { useApi } from '../api';

export function usePower() {
  const { api } = useApi();
  const [pool, setPool] = useState({ ring: new BN(0), kton: new BN(0) });
  const calcPower = useCallback(
    (selectedAsset: Fund | Asset | null, amount?: string) => {
      if (!selectedAsset) {
        return new BN(0);
      }

      const value = toWei({
        value: amount || (selectedAsset as Fund).amount,
        unit: getUnit(+selectedAsset.token.decimal),
      });
      const ktonBonded = new BN(0);
      const ringBonded = new BN(0);
      const ktonExtra = isKton(selectedAsset.asset) ? new BN(value) : new BN(0);
      const ringExtra = isRing(selectedAsset.asset) ? new BN(value) : new BN(0);
      const { ring: ringPool, kton: ktonPool } = pool;
      const powerBase = assetToPower(ringBonded, ktonBonded, ringPool, ktonPool);
      const powerTelemetry = assetToPower(
        ringBonded.add(ringExtra),
        ktonBonded.add(ktonExtra),
        ringPool.add(ringExtra),
        ktonPool.add(ktonExtra)
      );

      return powerTelemetry.minus(powerBase).toFixed(0);
    },
    [pool]
  );

  useEffect(() => {
    const ringPool = from<Promise<RingBalance>>(api.query.staking.ringPool());
    const ktonPool = from<Promise<KtonBalance>>(api.query.staking.ktonPool());
    const sub$$ = zip(ringPool, ktonPool).subscribe(([ring, kton]) =>
      setPool({ ring: new BN(ring.toString()), kton: new BN(kton.toString()) })
    );

    return () => sub$$.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { calcPower, pool };
}
