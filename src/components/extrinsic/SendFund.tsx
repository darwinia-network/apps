import { web3FromAddress } from '@polkadot/extension-dapp';
import { AutoComplete, Form, Input } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { upperFirst } from 'lodash';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { catchError, from, NEVER, Observable, Observer, switchMap, switchMapTo, tap } from 'rxjs';
import { validateMessages } from '../../config';
import i18n from '../../config/i18n';
import { useAccount, useApi } from '../../hooks';
import { useTx } from '../../hooks/tx';
import { AvailableBalance, Tx } from '../../model';
import {
  extrinsicSpy,
  fromWei,
  getUnit,
  insufficientBalanceRule,
  isRing,
  isSameAddress,
  isValidAddress,
  toWei,
  waitUntilConnected,
} from '../../utils';
import { Balance } from './Balance';

interface TransferValues {
  from: string;
  to: string;
  amount: number;
}

export interface TransferProps {
  asset: AvailableBalance;
  signal: Observable<boolean>;
  onSuccess: (value: Tx) => void;
  onFail: (value: Tx) => void;
}

export function SendFund({ asset, signal, onSuccess, onFail }: TransferProps) {
  const { t } = useTranslation();
  const {
    network,
    api,
    connection: { accounts },
  } = useApi();
  const [form] = useForm();
  const { account } = useAccount();
  const { observer } = useTx();

  useEffect(() => {
    const sub$$ = signal
      .pipe(
        switchMap((_) => from(form.validateFields()).pipe(catchError(() => NEVER))),
        switchMap((values: TransferValues) => {
          const { to, amount, from: sender } = values;
          const obs = new Observable((spy: Observer<Tx>) => {
            waitUntilConnected(api!)
              .then(() => {
                const moduleName = isRing(asset.chainInfo?.symbol) ? 'balances' : 'kton';

                return api!.tx[moduleName]
                  .transfer(to, toWei({ value: amount, unit: getUnit(Number(asset.chainInfo?.decimal)) ?? 'gwei' }))
                  .signAndSend(sender, extrinsicSpy(spy));
              })
              .catch((error) => {
                spy.error({ status: 'error', error });
              });
          });

          return from(web3FromAddress(sender)).pipe(
            tap((injector) => api?.setSigner(injector.signer)),
            switchMapTo(obs)
          );
        })
      )
      .subscribe({
        ...observer,
        next: (value) => {
          observer.next(value);

          if (value.status === 'finalized') {
            onSuccess(value);
          }
        },
        error: (err) => {
          observer.error(err);
          onFail(err);
        },
      });

    return () => {
      sub$$.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Form
      name="transfer"
      form={form}
      initialValues={{ from: account, to: accounts[0].address, amount: 0 }}
      layout="vertical"
      validateMessages={validateMessages[i18n.language as 'en' | 'zh-CN' | 'zh']}
    >
      <Form.Item
        name="from"
        label={t('Send from account')}
        rules={[{ required: true }]}
        extra={
          <span className="ml-4 mt-2 text-xs">
            <span className="mr-2">{t('Available Balance')}:</span>
            <span>
              {fromWei({ value: asset.max, unit: getUnit(Number(asset.chainInfo?.decimal)) || 'gwei' })}{' '}
              {asset.chainInfo?.symbol}
            </span>
          </span>
        }
      >
        <Input size="large" disabled />
      </Form.Item>

      <Form.Item
        name="to"
        label={t('Send to Address')}
        rules={[
          { required: true },
          {
            validator(_, value) {
              return !isSameAddress(account, value) ? Promise.resolve() : Promise.reject();
            },
            message: t('The sending address and the receiving address cannot be the same'),
          },
          {
            validator(_, value) {
              return isValidAddress(value, network.name, true) ? Promise.resolve() : Promise.reject();
            },
            message: t('Please enter a valid {{network}} address', { network: upperFirst(network.name) }),
          },
        ]}
      >
        <AutoComplete
          options={accounts.map((item) => ({ label: `${item.meta?.name} - ${item.address}`, value: item.address }))}
          placeholder={t('Enter or select one from these below')}
        >
          <Input size="large" />
        </AutoComplete>
      </Form.Item>

      <Form.Item
        name="amount"
        label={t('Amount')}
        rules={[{ required: true }, insufficientBalanceRule({ t, compared: asset.max, token: asset.chainInfo })]}
      >
        <Balance size="large" className="flex-1">
          <div
            className="bg-gray-200 border border-l-0 p-2 rounded-r-lg text-gray-400 uppercase"
            style={{ borderColor: '#d9d9d9' }}
          >
            {asset.chainInfo?.symbol}
          </div>
        </Balance>
      </Form.Item>
    </Form>
  );
}
