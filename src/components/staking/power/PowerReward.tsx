import { KtonBalance, RingBalance } from '@darwinia/types';
import BN from 'bn.js';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from, zip } from 'rxjs';
import { useApi } from '../../../hooks';
import { assetToPower, getUnit, isKton, isRing, toWei } from '../../../utils';
import { Fund } from '../../widget/form-control/FundsControl';

interface PowerRewardProps {
  selectedAsset: Fund | null;
}

export function PowerReward({ selectedAsset }: PowerRewardProps) {
  const { t } = useTranslation();
  const { api } = useApi();
  const [pool, setPool] = useState({ ring: new BN(0), kton: new BN(0) });

  const calcPower = useCallback(() => {
    if (!selectedAsset) {
      return '0';
    }

    const value = toWei({ value: selectedAsset.amount, unit: getUnit(+selectedAsset.token.decimal) });
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
  }, [pool, selectedAsset]);

  useEffect(() => {
    const ringPool = from<Promise<RingBalance>>(api.query.staking.ringPool());
    const ktonPool = from<Promise<KtonBalance>>(api.query.staking.ktonPool());
    const sub$$ = zip(ringPool, ktonPool).subscribe(([ring, kton]) =>
      setPool({ ring: new BN(ring.toString()), kton: new BN(kton.toString()) })
    );

    return () => sub$$.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const power = calcPower();

  return selectedAsset && Number(power) > 0 ? <p>{t('You will get {{amount}} Power', { amount: power })}</p> : null;
}
