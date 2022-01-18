import { Button, Card } from 'antd';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../hooks';
import { AvailableBalance } from '../../model';
import { fromWei, prettyNumber } from '../../utils';

export interface Asset extends AvailableBalance {
  total: number;
}

interface AssetOverviewProps {
  asset: Asset;
}

export function AssetOverview({ asset }: AssetOverviewProps) {
  const { t } = useTranslation();
  const { network } = useApi();

  return (
    <Card className="p-4">
      <div className="flex gap-4 items-center">
        <img src="/image/ring.svg" className="w-12" />
        <div>
          <h1 className="uppercase text-lg font-bold text-black">{asset.chainInfo?.symbol}</h1>
          <span>{fromWei({ value: asset.total }, prettyNumber)}</span>
        </div>
      </div>

      <hr className={`my-6 opacity-20 h-0.5 bg-${network.name}`} />

      <div className="flex items-center justify-between">
        <div className="inline-flex gap-2 opacity-60">
          <span>{t('Available')}:</span>
          <span>{fromWei({ value: asset.max }, prettyNumber)}</span>
        </div>

        {/* TODO: 没找到转账的设计图 */}
        <Button>{t('Transfer')}</Button>
      </div>
    </Card>
  );
}
