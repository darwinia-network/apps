import { QuestionCircleFilled } from '@ant-design/icons';
import { Skeleton, Tooltip } from 'antd';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStaking } from '../../hooks';
import { AssetOverviewProps } from '../../model';
import { fromWei, isRing, prettyNumber, getTokenIconSrcBySymbol } from '../../utils';

function Description({ title, value }: { title: string; value: string }) {
  const valueSplit = value.split('.');
  return (
    <div className="inline-flex dark:text-gray-700">
      <span className="opacity-60" style={{ minWidth: '100px' }}>
        {title}
      </span>
      <span className="ml-4 text-sm font-semibold">{valueSplit[0]}.</span>
      <span className="text-sm opacity-60">{valueSplit.length > 1 ? valueSplit[1] : '0'}</span>
    </div>
  );
}

export function AssetOverview({ asset }: AssetOverviewProps) {
  const { t } = useTranslation();
  const { stakingDerive, isStakingLedgerEmpty, isStakingDeriveLoading } = useStaking();
  const tokenIconSrc = useMemo(() => getTokenIconSrcBySymbol(asset.token?.symbol), [asset.token?.symbol]);

  const ledger = useMemo(() => {
    if (isStakingLedgerEmpty) {
      return { bonded: null, unbonding: null, locked: null, total: null };
    }

    const { stakingLedger, unlockingTotalValue, unlockingKtonTotalValue } = stakingDerive!;

    if (isRing(asset.token.symbol)) {
      const locked = stakingLedger.activeDepositRing.toBn();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const bonded = (stakingLedger.active || stakingLedger.activeRing).toBn().sub(locked);

      return {
        bonded,
        locked,
        unbonding: unlockingTotalValue,
      };
    }

    const bonded = stakingLedger.activeKton?.toBn();

    return {
      bonded,
      locked: null,
      unbonding: unlockingKtonTotalValue,
    };
  }, [asset.token.symbol, isStakingLedgerEmpty, stakingDerive]);

  if (isStakingDeriveLoading) {
    return <Skeleton active />;
  }

  return (
    <div className="relative rounded-xl bg-white h-full shadow-xxl">
      <div className="grid grid-cols-3 p-6 pl-0">
        <div className="flex flex-col gap-4 items-center">
          <img src={tokenIconSrc} className="w-14" />
          <h1 className="uppercase text-lg font-medium text-black">{asset.token?.symbol}</h1>
        </div>

        <div className="flex flex-col col-span-2 justify-between">
          <Description title={t('Available')} value={fromWei({ value: asset.max }, prettyNumber)} />
          <Description title={t('Bonded')} value={fromWei({ value: ledger.bonded }, prettyNumber)} />
          {isRing(asset.asset) && (
            <Description title={t('Locked')} value={fromWei({ value: ledger.locked }, prettyNumber)} />
          )}
          <Description title={t('Unbonding')} value={fromWei({ value: ledger.unbonding }, prettyNumber)} />
          <Description title={t('Total')} value={fromWei({ value: asset.total }, prettyNumber)} />
        </div>
      </div>
      <Tooltip
        title={
          <div className="flex flex-col gap-4">
            <p>{t('Available The amount of tokens that are able to staking, bond and transfer.')}</p>
            {isRing(asset.token.symbol) && (
              <p>
                {t(
                  'Locked The amount of tokens that cannot be operated directly and has a lock limit, which is used to gain power and earn additional KTON rewards. '
                )}
              </p>
            )}
            <p>
              {t(
                'Bonded The amount of tokens that cannot be operated directly but does not have a lock limit, which is used to gain power and can be taken out at any time(with a 14-day unbonding period) or add lock limit.'
              )}
            </p>
            <p>{t('Unbonding The amount of tokens that has been unlocked but in the unbonding period.')}</p>
          </div>
        }
        placement="right"
        className="absolute top-4 right-4 text-gray-400"
      >
        <QuestionCircleFilled className="cursor-pointer" />
      </Tooltip>
    </div>
  );
}
