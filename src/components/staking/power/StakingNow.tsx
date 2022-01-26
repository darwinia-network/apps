import { Button, Checkbox, Form, Modal, Select } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import BN from 'bn.js';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from, switchMap, takeWhile, zip } from 'rxjs';
import { validateMessages } from '../../../config';
import i18n from '../../../config/i18n';
import { useAccount, useApi, useIsMounted } from '../../../hooks';
import { useTx } from '../../../hooks/tx';
import { Asset } from '../../../model';
import {
  assetToPower,
  getUnit,
  insufficientBalanceRule,
  isKton,
  isRing,
  signAndSendExtrinsic,
  toWei,
} from '../../../utils';
import { Balance } from '../../widget/Balance';
import { PrettyAccount } from '../../widget/PrettyAccount';

const MAX_PERIOD = 36;
const LOCK_PERIOD = [0, ...new Array(MAX_PERIOD).fill(0).map((_, index) => index + 1)];

type Payee = 'Staked' | 'Stash' | 'Controller' | 'Account';

interface StakingFormValue {
  stash: string;
  controller: string;
  payee: Payee;
  promiseMonth: number;
  amount: string;
}

// eslint-disable-next-line complexity
export function StakingNow() {
  const { t } = useTranslation();
  const {
    connection: { accounts },
    api,
  } = useApi();
  const [form] = useForm<StakingFormValue>();
  const { account, accountWithMeta, assets } = useAccount();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [payee, setPayee] = useState<Payee>('Staked');
  const [duration, setDuration] = useState(0);
  const [power, setPower] = useState('');
  const [pool, setPool] = useState({ ring: new BN(0), kton: new BN(0) });
  const { observer, tx } = useTx();
  const isMounted = useIsMounted();

  const calcPower = useCallback(
    (amount: string) => {
      if (!selectedAsset) {
        return new BN(0);
      }

      const value = toWei({ value: amount, unit: getUnit(+selectedAsset.token.decimal) });
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
    },
    [pool, selectedAsset]
  );

  const launchStaking = useCallback(() => {
    from(form.validateFields())
      .pipe(
        switchMap((value) => {
          const { controller, amount, promiseMonth, stash } = value;
          const balance = {
            [`${selectedAsset!.asset}balance`]: toWei({ value: amount, unit: getUnit(+selectedAsset!.token.decimal) }),
          };
          const destination = payee === 'Account' ? { Account: '' } : payee;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const extrinsic = api.tx.staking.bond(controller, balance, destination, promiseMonth);

          return signAndSendExtrinsic(api, stash, extrinsic);
        }),
        takeWhile(() => isMounted)
      )
      .subscribe({
        ...observer,
        next: (value) => {
          observer.next(value);

          if (value.status === 'finalized') {
            setIsVisible(false);
          }
        },
      });
  }, [api, form, isMounted, observer, payee, selectedAsset]);

  useEffect(() => {
    const ringPool = from(api.query.staking.ringPool());
    const ktonPool = from(api.query.staking.ktonPool());
    const sub$$ = zip(ringPool, ktonPool).subscribe(([ring, kton]) =>
      setPool({ ring: new BN(ring.toString()), kton: new BN(kton.toString()) })
    );

    return () => sub$$.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (assets.length) {
      setSelectedAsset(assets[0]);
    }
  }, [form, assets]);

  return (
    <>
      <h1 className="text-xl font-bold">{t('Get Power')}</h1>
      <ul className="leading-24 text-gray-400 list-decimal px-4 my-4">
        <li>
          {t(
            'You need to stake some KTON or RING to get POWER. The higher the POWER, the greater the share of reward.'
          )}
        </li>
        <li>{t('Please make sure that you have some excess RING in this account as gas fee.')}</li>
      </ul>

      <Button onClick={() => setIsVisible(true)}>{t('Staking now')}</Button>

      <Modal
        title={t('Bonding preferences')}
        onCancel={() => {
          setIsVisible(false);
        }}
        visible={isVisible}
        okText={t('Bond')}
        onOk={launchStaking}
        okButtonProps={{ disabled: !!tx }}
      >
        <Form
          form={form}
          layout="vertical"
          validateMessages={validateMessages[i18n.language as 'en' | 'zh-CN' | 'zh']}
          initialValues={{
            stash: account,
            controller: account,
            payee: 'Staked',
            promiseMonth: 0,
          }}
        >
          <Form.Item name="stash" label={t('Stash account')} rules={[{ required: true }]}>
            <PrettyAccount
              account={accountWithMeta}
              className="border overflow-hidden px-2 py-1 rounded-lg bg-gray-100"
            />
          </Form.Item>

          <Form.Item name="controller" label={t('Controller account')} rules={[{ required: true }]}>
            <Select size="large">
              {accounts.map((item) => (
                <Select.Option value={item.address} key={item.address}>
                  <PrettyAccount account={item} />
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label={t('Bonded amount')}
            rules={[
              { required: true },
              selectedAsset
                ? insufficientBalanceRule({
                    t,
                    compared: selectedAsset.max,
                    token: selectedAsset.token,
                  })
                : {},
            ]}
            extra={
              <span>
                {t('Please keep a little {{token}} as fee', {
                  token: assets.find((item) => isRing(item.asset))?.token?.symbol ?? 'RING',
                })}
              </span>
            }
          >
            <Balance
              compact
              onChange={(value) => {
                const result = calcPower(value);
                setPower(result.toString());
              }}
              size="large"
              className="flex-1"
            >
              <Select<string>
                onChange={(unit) => {
                  const cur = assets.find((item) => item.token?.symbol === unit);

                  if (cur) {
                    setSelectedAsset(cur);
                  }
                }}
                value={selectedAsset?.token?.symbol}
                size="large"
                style={{ border: 'none' }}
              >
                {assets.map((item) => {
                  const { token } = item;

                  return (
                    <Select.Option value={token.symbol} key={token.symbol}>
                      <span className="uppercase">{token.symbol}</span>
                    </Select.Option>
                  );
                })}
              </Select>
            </Balance>
          </Form.Item>

          <Form.Item name="payee" label={t('Payment destination')} rules={[{ required: true }]}>
            {/* 1. Staked: null 2. Stash: null 3. Controller null 4. Account: 'the selected Account' */}
            <Select<string> size="large" onChange={(value) => setPayee(value as Payee)}>
              <Select.Option value="Staked">{t('Stash account (increase the amount at stake)')}</Select.Option>
              <Select.Option value="Stash">{t('Stash account (do not increase the amount at stake)')}</Select.Option>
              <Select.Option value="Controller">{t('Controller account')}</Select.Option>
              <Select.Option value="Account">{t('Other Account')}</Select.Option>
            </Select>
          </Form.Item>

          {payee === 'Account' && (
            <Form.Item name="destination" label={t('Payment account')} rules={[{ required: true }]}>
              <Select size="large">
                {accounts.map((item) => (
                  <Select.Option value={item.address} key={item.address}>
                    <PrettyAccount account={item} />
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {isRing(selectedAsset?.asset) && (
            <Form.Item name="promiseMonth" label={t('Lock limit')} rules={[{ required: true }]}>
              <Select size="large" onChange={(value) => setDuration(Number(value))}>
                {LOCK_PERIOD.map((item, index) => (
                  <Select.Option value={item} key={index}>
                    {!item
                      ? t('No fixed term (Set a lock period will get additional CKTON rewards)')
                      : t('{{count}} Month', { count: item })}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {!!duration && isRing(selectedAsset?.asset) && (
            <Form.Item
              name="known"
              rules={[{ required: true }]}
              className="border p-4 rounded-lg bg-gray-200"
              extra={
                <div>
                  <p>
                    {t(
                      'After setting a lock limit, you will receive an additional {{KTON}} bonus; if you unlock it in advance within the lock limit, you will be charged a penalty of 3 times the {{KTON}} reward.',
                      { KTON: assets.find((item) => isKton(item.asset))?.token.symbol }
                    )}
                  </p>
                </div>
              }
            >
              <Checkbox>{t('I Accept')}</Checkbox>
            </Form.Item>
          )}

          {power && <p>{t('You will get {{amount}} Power', { amount: power })}</p>}
        </Form>
      </Modal>
    </>
  );
}
