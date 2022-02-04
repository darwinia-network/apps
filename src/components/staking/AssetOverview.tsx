import { QuestionCircleFilled } from '@ant-design/icons';
import { Tooltip } from 'antd';
import BN from 'bn.js';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useStaking } from '../../hooks';
import { AssetOverviewProps } from '../../model';
import { fromWei, isRing, prettyNumber } from '../../utils';

function Description({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="inline-flex gap-4 opacity-60">
      <span style={{ minWidth: '100px' }}>{title}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

export function AssetOverview({ asset }: AssetOverviewProps) {
  const { t } = useTranslation();
  const { account } = useAccount();
  const { stakingDerive, isStakingLedgerEmpty } = useStaking();
  const as = useMemo(() => (isRing(asset.token?.symbol) ? 'ring' : 'kton'), [asset.token?.symbol]);
  const tips = useMemo(() => {
    if (isRing(asset.token?.symbol)) {
      return (
        <div className="flex flex-col gap-4">
          <p>{t('Available: The amount of tokens that are able to transfer and bond.')}</p>
          <p>
            {t(
              ' Locked: The amount of tokens that cannot be operated directly and has a lock limit, which is used to gain power and earn additional KTON rewards. '
            )}
          </p>
          <p>
            {t(
              'Bonded: The amount of tokens that cannot be operated directly but does not have a lock limit, which is used to gain power and can be taken out at any time(with a 14-day unbonding period) or add lock limit.'
            )}
          </p>
          <p>{t('Unbonding: The amount of tokens that has been unlocked but in the unbonding period.')}</p>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-4">
        <p>{t('available: The amount of tokens that are able to transfer, bond and transfer.')}</p>
        <p>
          {t(
            'bonded: The amount of tokens that cannot operated directly but does not have lock limit, which is used to gain voting power and can be taken out at any time (with a 14-day unbonding period) or add lock limit.'
          )}
        </p>
        <p>{t('unbonding: The amount of tokens that has been unlocked but in the unbonding period.')}</p>
      </div>
    );
  }, [asset.token?.symbol, t]);

  const ledger = useMemo(() => {
    if (isStakingLedgerEmpty) {
      return { bonded: null, unbonding: null, locked: null, total: null };
    }

    const { stakingLedger } = stakingDerive!;
    if (isRing(asset.token.symbol)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const locked = stakingLedger.activeDepositRing.toBn();
      const bonded = stakingLedger.active.toBn().sub(locked);
      const { ringStakingLock } = stakingLedger.toJSON() as {
        ringStakingLock: { unbondings: { amount: number; until: number }[] };
      };

      return {
        bonded,
        locked,
        // TODO: in old version, the value comes form stakingDerive.unlockingTotalValue
        unbonding: ringStakingLock.unbondings.reduce(
          (acc: BN, cur: { amount: number }) => acc.add(new BN(cur.amount)),
          new BN(0)
        ),
      };
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const bonded = stakingLedger.activeKton?.toBn();
    const { ktonStakingLock } = stakingLedger.toJSON() as {
      ktonStakingLock: { unbondings: { amount: number; until: number }[] };
    };
    return {
      bonded,
      locked: null,
      unbonding: ktonStakingLock.unbondings.reduce(
        (acc: BN, cur: { amount: number }) => acc.add(new BN(cur.amount)),
        new BN(0)
      ),
    };
  }, [asset.token.symbol, isStakingLedgerEmpty, stakingDerive]);

  if (isStakingLedgerEmpty && account) {
    return null;
  }

  return (
    <div className="relative rounded-xl bg-white">
      <div className="grid grid-cols-3 p-6 pl-0">
        <div className="flex flex-col gap-4 items-center">
          <img src={`/image/${as}.svg`} className="w-14" />
          <h1 className="uppercase text-lg font-bold text-black">{asset.token?.symbol}</h1>
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
      <Tooltip title={tips} placement="right" className="absolute top-4 right-4">
        <QuestionCircleFilled className="cursor-pointer" />
      </Tooltip>
    </div>
  );
}
