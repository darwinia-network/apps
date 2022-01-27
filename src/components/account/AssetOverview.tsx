import { Button, Card, Form } from 'antd';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useApi } from '../../hooks';
import { AssetOverviewProps } from '../../model';
import { fromWei, getUnit, insufficientBalanceRule, isRing, prettyNumber, toWei } from '../../utils';
import { FormModal } from '../modal/FormModal';
import { Balance } from '../widget/Balance';
import { AddressControl } from '../widget/form-control/AddressControl';

interface TransferFormValues {
  from: string;
  to: string;
  amount: number;
  [key: string]: unknown;
}

export function AssetOverview({ asset, refresh }: AssetOverviewProps) {
  const { t } = useTranslation();
  const {
    network,
    api,
    connection: { accounts },
  } = useApi();
  const { account } = useAccount();
  const [isVisible, setIsVisible] = useState(false);
  const as = useMemo(() => (isRing(asset.token?.symbol) ? 'ring' : 'kton'), [asset.token?.symbol]);

  return (
    <>
      <Card className="p-4">
        <div className="flex gap-4 items-center">
          <img src={`/image/${as}.svg`} className="w-12" />
          <div>
            <h1 className="uppercase text-lg font-bold text-black">{asset.token?.symbol}</h1>
            <span>{fromWei({ value: asset.total }, prettyNumber)}</span>
          </div>
        </div>

        <hr className={`my-6 opacity-20 h-0.5 bg-${network.name}`} />

        <div className="flex items-center justify-between">
          <div className="inline-flex gap-2 opacity-60">
            <span>{t('Available')}:</span>
            <span>{fromWei({ value: asset.max }, prettyNumber)}</span>
          </div>

          <Button onClick={() => setIsVisible(true)}>{t('Transfer')}</Button>
        </div>
      </Card>

      <FormModal<TransferFormValues>
        modalProps={{ visible: isVisible }}
        onSuccess={() => {
          setIsVisible(false);
          refresh();
        }}
        onFail={() => setIsVisible(false)}
        onCancel={() => setIsVisible(false)}
        initialValues={{ from: account, to: accounts[0].address, amount: 0 }}
        createExtrinsic={(values) => {
          const { to, amount } = values;
          const moduleName = isRing(asset.token?.symbol) ? 'balances' : 'kton';

          return api.tx[moduleName].transfer(
            to,
            toWei({ value: amount, unit: getUnit(Number(asset.token?.decimal)) ?? 'gwei' })
          );
        }}
      >
        <AddressControl
          name="from"
          label={'Send from account'}
          extra={
            <span className="ml-4 mt-2 text-xs">
              <span className="mr-2">{t('Available Balance')}:</span>
              <span>
                {fromWei({ value: asset.max, unit: getUnit(Number(asset.token?.decimal)) || 'gwei' })}{' '}
                {asset.token?.symbol}
              </span>
            </span>
          }
          disabled
        ></AddressControl>

        <AddressControl name="to" label={'Send to Address'} />

        <Form.Item
          name="amount"
          label={t('Amount')}
          rules={[{ required: true }, insufficientBalanceRule({ t, compared: asset.max, token: asset.token })]}
        >
          <Balance size="large" className="flex-1">
            <div
              className="bg-gray-200 border border-l-0 p-2 rounded-r-lg text-gray-400 uppercase"
              style={{ borderColor: '#d9d9d9' }}
            >
              {asset.token?.symbol}
            </div>
          </Balance>
        </Form.Item>
      </FormModal>
    </>
  );
}
