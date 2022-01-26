import Identicon from '@polkadot/react-identicon';
import { Button, Card, Checkbox, Form, Modal, Radio, Select, Statistic } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { validateMessages } from '../../config';
import i18n from '../../config/i18n';
import { useAccount, useApi, useStakingAccount } from '../../hooks';
import { Asset } from '../../model';
import { insufficientBalanceRule, isKton, isRing } from '../../utils';
import { Balance } from '../widget/Balance';
import { PrettyAccount } from '../widget/PrettyAccount';

// eslint-disable-next-line no-magic-numbers
const LOCK_PERIOD = [0, ...new Array(36).fill(0).map((_, index) => index + 1)];

// eslint-disable-next-line complexity
function PowerEmpty() {
  const { t } = useTranslation();
  const {
    connection: { accounts },
  } = useApi();
  const [form] = useForm();
  const { account, accountWithMeta, assets } = useAccount();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [destination, setDestination] = useState('stashIncreasable');
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (assets.length) {
      form.setFieldsValue({ unit: assets[0].token?.symbol });
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
      >
        <Form
          form={form}
          layout="vertical"
          validateMessages={validateMessages[i18n.language as 'en' | 'zh-CN' | 'zh']}
          initialValues={{
            stash: account,
            controller: account,
            paymentDestination: 'stashIncreasable',
            lockDuration: 0,
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
            <Balance compact size="large" className="flex-1">
              <Select<string>
                onChange={(unit) => {
                  const cur = assets.find((item) => item.token?.symbol === unit);

                  if (cur) {
                    setSelectedAsset(cur);
                  }

                  form.setFieldsValue({ unit });
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

          <Form.Item name="paymentDestination" label={t('Payment destination')} rules={[{ required: true }]}>
            <Select<string> size="large" onChange={(value) => setDestination(value)}>
              <Select.Option value="stashIncreasable">
                {t('Stash account (increase the amount at stake)')}
              </Select.Option>
              <Select.Option value="stashNonIncreasable">
                {t('Stash account (do not increase the amount at stake)')}
              </Select.Option>
              <Select.Option value="controller">{t('Controller account')}</Select.Option>
              <Select.Option value="other">{t('Other Account')}</Select.Option>
            </Select>
          </Form.Item>

          {destination === 'other' && (
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
            <Form.Item name="lockDuration" label={t('Lock limit')} rules={[{ required: true }]}>
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

          <p>{t('You will get {{amount}} Power', { amount: 999 })}</p>
        </Form>
      </Modal>
    </>
  );
}

// eslint-disable-next-line no-magic-numbers
const RANGES = [2, 6, 18, 54, 162, 336];

export function PowerOverview() {
  const { t } = useTranslation();
  const [range, setRange] = useState<number>(RANGES[0]);
  const { stashAccount } = useStakingAccount();

  if (!stashAccount) {
    return (
      <Card className="my-8">
        <PowerEmpty />
      </Card>
    );
  }

  return (
    <>
      <Card className="my-8">
        <Radio.Group
          value={range}
          onChange={(event) => {
            setRange(Number(+event.target.value));
          }}
        >
          {RANGES.map((item, index) => (
            <Radio.Button value={item} key={index}>
              {t('{{count}} days', { count: item })}
            </Radio.Button>
          ))}
        </Radio.Group>
        <div className="flex justify-between items-center mt-8">
          <Statistic title={t('Claimed')} value={'34,116.768 RING'} />

          <Statistic title={t('Claimed')} value={'34,116.768 RING'} />

          <div className="flex items-center gap-4">
            <Button type="primary">{t('Claim Reward')}</Button>
            <Button>{t('Reward History')}</Button>
          </div>
        </div>
      </Card>

      <Card>
        <h1 className="text-lg font-bold mb-8">{t('Nomination')}</h1>

        <div className="flex justify-between items-center border-b py-2">
          <div className="flex items-center gap-2">
            <Identicon value={'5FA7CzAgT5fNDFRdb4UWSZX3b9HJsPuR7F5BF4YotSpKxAA2'} size={32} />
            <span>{t('5FA7CzAgT5fNDFRdb4UWSZX3b9HJsPuR7F5BF4YotSpKxAA2')}</span>
          </div>
          <span>{t('{{amount}} Powder', { amount: 0 })}</span>
        </div>
      </Card>
    </>
  );
}
