import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from '../../../hooks';
import { Fund } from '../../../model';
import { fromWei, isKton, ringToKton, toWei } from '../../../utils';

interface KtonRewardProps {
  selectedAsset: Fund | null;
  promiseMonth: number;
}

export function KtonReward({ selectedAsset, promiseMonth }: KtonRewardProps) {
  const { t } = useTranslation();
  const { assets } = useAccount();
  const target = useMemo(() => assets.find((item) => isKton(item.asset))!, [assets]);

  return selectedAsset && promiseMonth > 0 ? (
    <p>
      {t('You will get {{amount}} {{symbol}}', {
        amount: fromWei({ value: ringToKton(toWei({ value: selectedAsset.amount }), promiseMonth) }),
        symbol: target.token.symbol.toUpperCase(),
      })}
    </p>
  ) : null;
}
