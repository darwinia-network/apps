import { Button, Card, Form } from 'antd';
import { BN_HUNDRED, BN, isFunction } from '@polkadot/util';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from, Subscription } from 'rxjs';
import { useAccount, useApi } from '../../hooks';
import { AssetOverviewProps, DarwiniaAsset } from '../../model';
import { fromWei, getUnit, insufficientBalanceRule, isRing, isSameAddress, prettyNumber, toWei } from '../../utils';
import { FormModal } from '../widget/FormModal';
import { PrettyAmount } from '../widget/PrettyAmount';
import { BalanceControl } from '../widget/form-control/BalanceControl';
import { AddressItem } from '../widget/form-control/AddressItem';

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
  const [recipient, setRecipient] = useState<string>(accounts[0]?.address);
  const [isVisible, setIsVisible] = useState(false);
  const [transferrable, setTransferrable] = useState<BN | null>(null);

  const tokenIconSrc = useMemo(
    () => `/image/token-${(asset.token?.symbol || 'RING').toLowerCase()}.svg`,
    [asset.token?.symbol]
  );

  useEffect(() => {
    let sub$$: Subscription;

    if (recipient && isFunction(api.rpc.payment?.queryInfo)) {
      if (asset.asset === DarwiniaAsset.ring) {
        sub$$ = from(api.tx.balances?.transfer(recipient, asset.max).paymentInfo(account)).subscribe((res) => {
          const { partialFee } = res as unknown as { partialFee: BN };
          // eslint-disable-next-line no-magic-numbers
          const adjFee = partialFee.muln(110).div(BN_HUNDRED);
          const max = new BN(asset.max as string).sub(adjFee);

          setTransferrable(max.gt(api.consts.balances?.existentialDeposit) ? max : null);
        });
      } else {
        setTransferrable(new BN(asset.max as string));
      }
    } else {
      setTransferrable(null);
    }

    return () => {
      if (sub$$) {
        sub$$.unsubscribe();
      }
    };
  }, [api, asset, account, recipient]);

  return (
    <>
      <Card className="p-4 shadow-xxl">
        <div className="flex gap-4 items-center">
          <img src={tokenIconSrc} className="w-12" />
          <div>
            <h1 className="uppercase text-lg font-medium text-black dark:text-white">{asset.token?.symbol}</h1>
            <PrettyAmount amount={fromWei({ value: asset.total }, prettyNumber)} />
          </div>
        </div>

        <hr className={`my-6 opacity-20 h-0.5 bg-${network.name}`} />

        <div className="flex items-center justify-between">
          <div className="inline-flex items-center">
            <span className="opacity-60 font-normal text-base">{t('Available')}:</span>
            <PrettyAmount amount={fromWei({ value: asset.max }, prettyNumber)} integerClassName="ml-2" />
          </div>

          <Button onClick={() => setIsVisible(true)} className="lg:px-12">
            {t('Transfer')}
          </Button>
        </div>
      </Card>

      <FormModal<TransferFormValues>
        modalProps={{ visible: isVisible, title: t('Send {{symbol}}', { symbol: asset.token.symbol }) }}
        onSuccess={() => {
          setIsVisible(false);
          refresh();
        }}
        onFail={() => setIsVisible(false)}
        onCancel={() => setIsVisible(false)}
        initialValues={{ from: account, to: accounts[0]?.address, amount: 0 }}
        defaultValues={{ from: account }}
        extrinsic={(values) => {
          const { to, amount } = values;
          const moduleName = isRing(asset.token?.symbol) ? 'balances' : 'kton';

          return api.tx[moduleName].transfer(
            to,
            toWei({ value: amount, unit: getUnit(Number(asset.token?.decimal)) ?? 'gwei' })
          );
        }}
      >
        <AddressItem
          name="from"
          label={'Sender'}
          extra={
            <span className="ml-4 mt-2 text-xs">
              <span className="mr-2">{t('transferrable')}:</span>
              <span>
                {fromWei({ value: transferrable, unit: getUnit(Number(asset.token?.decimal)) || 'gwei' })}{' '}
                {asset.token?.symbol}
              </span>
            </span>
          }
          disabled
        ></AddressItem>

        <AddressItem
          name="to"
          label={'Receiver'}
          rules={[
            {
              validator(_, value) {
                setRecipient(value);
                return !isSameAddress(account, value) ? Promise.resolve() : Promise.reject();
              },
              message: t('The sending address and the receiving address cannot be the same'),
            },
          ]}
          extra={null}
        />

        <Form.Item
          name="amount"
          label={t('Amount')}
          rules={[{ required: true }, insufficientBalanceRule({ t, compared: transferrable, token: asset.token })]}
        >
          <BalanceControl compact size="large" className="flex-1">
            <div
              className="bg-gray-200 border border-l-0 p-2 rounded-r-lg text-gray-400 uppercase"
              style={{ borderColor: '#d9d9d9' }}
            >
              {asset.token?.symbol}
            </div>
          </BalanceControl>
        </Form.Item>
      </FormModal>
    </>
  );
}
