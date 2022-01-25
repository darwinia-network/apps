import Identicon from '@polkadot/react-identicon';
import { Button, Card, Radio, Statistic } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStakingAccount } from '../../hooks';

function PowerEmpty() {
  const { t } = useTranslation();

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

      <Button>{t('Staking now')}</Button>
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
