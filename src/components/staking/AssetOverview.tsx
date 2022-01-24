import { QuestionCircleFilled } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  const as = useMemo(() => (isRing(asset.chainInfo?.symbol) ? 'ring' : 'kton'), [asset.chainInfo?.symbol]);
  const tips = useMemo(() => {
    if (isRing(asset.chainInfo?.symbol)) {
      return (
        <div className="flex flex-col gap-4">
          <p>Available: The amount of tokens that are able to transfer and bond.</p>
          <p>
            Locked: The amount of tokens that cannot be operated directly and has a lock limit, which is used to gain
            power and earn additional KTON rewards.{' '}
          </p>
          <p>
            Bonded: The amount of tokens that cannot be operated directly but does not have a lock limit, which is used
            to gain power and can be taken out at any time(with a 14-day unbonding period) or add lock limit.
          </p>
          <p>Unbonding: The amount of tokens that has been unlocked but in the unbonding period.</p>
        </div>
      );
    }
    return t('');
  }, [asset.chainInfo?.symbol, t]);

  return (
    <div className="relative rounded-xl bg-white">
      <div className="grid grid-cols-3 p-6 pl-0">
        <div className="flex flex-col gap-4 items-center">
          <img src={`/image/${as}.svg`} className="w-14" />
          <h1 className="uppercase text-lg font-bold text-black">{asset.chainInfo?.symbol}</h1>
        </div>

        <div className="flex flex-col col-span-2 justify-between">
          <Description title={t('Available')} value={fromWei({ value: asset.max }, prettyNumber)} />
          <Description title={t('Locked')} value={fromWei({ value: asset.max }, prettyNumber)} />
          <Description title={t('Bonded')} value={fromWei({ value: asset.max }, prettyNumber)} />
          <Description title={t('Unbonding')} value={fromWei({ value: asset.max }, prettyNumber)} />
          <Description title={t('Total')} value={fromWei({ value: asset.total }, prettyNumber)} />
        </div>
      </div>
      <Tooltip title={tips} placement="right" className="absolute top-4 right-4">
        <QuestionCircleFilled className="cursor-pointer" />
      </Tooltip>
    </div>
  );
}
