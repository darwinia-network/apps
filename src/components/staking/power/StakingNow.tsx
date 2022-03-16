import { Button } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useApi } from '../../../hooks';
import { Fund } from '../../../model';
import { fundParam } from '../../../utils';
import { AddressItem } from '../../widget/form-control/AddressItem';
import { FundItem } from '../../widget/form-control/FundItem';
import { Label } from '../../widget/form-control/Label';
import { Payee } from '../../widget/form-control/PayeeControl';
import { PayeeItem } from '../../widget/form-control/PayeeItem';
import { PromiseMonthItem } from '../../widget/form-control/PromiseMonthItem';
import { FormModal } from '../../widget/FormModal';
import { KtonReward } from './KtonReward';
import { PowerReward } from './PowerReward';

interface StakingFormValue {
  stash: string;
  controller: string;
  payee: Payee;
  promiseMonth: number;
  amount: string;
  [key: string]: unknown;
}

// eslint-disable-next-line complexity
export function StakingNow() {
  const { t } = useTranslation();
  const { api } = useApi();
  const [form] = useForm<StakingFormValue>();
  const { account, assets } = useAccount();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Fund | null>(null);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (assets.length) {
      setSelectedAsset({ ...assets[0], amount: '0' });
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

      <FormModal<StakingFormValue>
        modalProps={{
          visible: isVisible,
          title: t('Bonding preferences'),
        }}
        extrinsic={(value) => {
          const {
            controller,
            amount,
            promiseMonth,
            payee: { type, account: acc },
          } = value;
          const balance = fundParam({ ...selectedAsset!, amount: (amount as unknown as Fund).amount });
          const destination = type === 'Account' ? { Account: acc } : type;

          return api.tx.staking.bond(controller, balance, destination, promiseMonth);
        }}
        onCancel={() => setIsVisible(false)}
        onSuccess={() => setIsVisible(false)}
        initialValues={{
          stash: account,
          controller: account,
          payee: { type: 'Staked', account: '' },
          promiseMonth: 0,
        }}
      >
        <AddressItem name="stash" label="Stash account" disabled />

        <AddressItem name="controller" label="Controller account" />

        <FundItem
          label={<Label text={t('Bonded amount')} />}
          name="amount"
          onChange={setSelectedAsset}
          rules={[{ required: true }]}
        />

        <PayeeItem
          name="payee"
          label={
            <Label
              text={t('Payment destination')}
              info={t('The destination account for any payments as either a nominator or validator')}
            />
          }
        />

        <PromiseMonthItem
          name="promiseMonth"
          selectedAsset={selectedAsset}
          label={'Lock limit'}
          onChange={(value) => setDuration(+value)}
        />

        <PowerReward selectedAsset={selectedAsset} />

        <KtonReward selectedAsset={selectedAsset} promiseMonth={duration} />
      </FormModal>
    </>
  );
}
