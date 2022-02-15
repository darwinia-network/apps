import { Button, Checkbox, Form, Modal, Select } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { upperCase } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from, switchMap, takeWhile } from 'rxjs';
import { validateMessages } from '../../../config';
import i18n from '../../../config/i18n';
import { useAccount, useApi, useIsMounted, usePower } from '../../../hooks';
import { useTx } from '../../../hooks/tx';
import { Asset } from '../../../model';
import { afterTxSuccess } from '../../../providers';
import { fundParam, insufficientBalanceRule, isKton, isRing, signAndSendExtrinsic } from '../../../utils';
import { IdentAccountAddress } from '../../widget/account/IdentAccountAddress';
import { BalanceControl } from '../../widget/form-control/BalanceControl';

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
  const { createObserver, tx } = useTx();
  const { calcPower } = usePower();
  const isMounted = useIsMounted();

  const launchStaking = useCallback(() => {
    const observer = createObserver({
      next: afterTxSuccess(() => setIsVisible(false)),
    });

    from(form.validateFields())
      .pipe(
        switchMap((value) => {
          const { controller, amount, promiseMonth, stash } = value;
          const balance = fundParam({ amount, ...selectedAsset! });
          const destination = payee === 'Account' ? { Account: '' } : payee;
          const extrinsic = api.tx.staking.bond(controller, balance, destination, promiseMonth);

          return signAndSendExtrinsic(api, stash, extrinsic);
        }),
        takeWhile(() => isMounted)
      )
      .subscribe(observer);
  }, [api, createObserver, form, isMounted, payee, selectedAsset]);

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
            <IdentAccountAddress
              account={accountWithMeta}
              className="border overflow-hidden px-2 py-1 rounded-lg bg-gray-100"
            />
          </Form.Item>

          <Form.Item name="controller" label={t('Controller account')} rules={[{ required: true }]}>
            <Select size="large">
              {accounts.map((item) => (
                <Select.Option value={item.address} key={item.address}>
                  <IdentAccountAddress account={item} />
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
            <BalanceControl
              compact
              onChange={(value) => {
                const result = calcPower(selectedAsset, value);
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
            </BalanceControl>
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
                    <IdentAccountAddress account={item} />
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
                      ? t('No fixed term (Set a lock period will get additional {{symbol}} rewards)', {
                          symbol: upperCase(assets.find((asset) => isKton(asset.asset))?.token.symbol ?? 'kton'),
                        })
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
