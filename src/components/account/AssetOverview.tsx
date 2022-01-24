import { Button, Card, Modal } from 'antd';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Observable, Subject } from 'rxjs';
import { useApi } from '../../hooks';
import { AssetOverviewProps } from '../../model';
import { fromWei, isRing, prettyNumber } from '../../utils';
import { SendFund } from '../extrinsic/SendFund';

export function AssetOverview({ asset, refresh }: AssetOverviewProps) {
  const { t } = useTranslation();
  const { network } = useApi();
  const [isTransferVisible, setIsTransferVisible] = useState(false);
  const as = useMemo(() => (isRing(asset.chainInfo?.symbol) ? 'ring' : 'kton'), [asset.chainInfo?.symbol]);
  const [subject] = useState<Subject<boolean>>(() => new Subject<boolean>());

  return (
    <>
      <Card className="p-4">
        <div className="flex gap-4 items-center">
          <img src={`/image/${as}.svg`} className="w-12" />
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

          <Button onClick={() => setIsTransferVisible(true)}>{t('Transfer')}</Button>
        </div>
      </Card>

      <Modal
        visible={isTransferVisible}
        title={t('Send funds')}
        destroyOnClose
        maskClosable={false}
        closable
        onCancel={() => {
          setIsTransferVisible(false);
        }}
        onOk={() => {
          subject.next(true);
          return null;
        }}
      >
        <SendFund
          signal={subject as Observable<boolean>}
          asset={asset}
          onSuccess={() => {
            setIsTransferVisible(false);
            refresh();
          }}
          onFail={() => {
            setIsTransferVisible(false);
          }}
        />
      </Modal>
    </>
  );
}
