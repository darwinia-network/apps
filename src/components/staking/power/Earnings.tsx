import Identicon from '@polkadot/react-identicon';
import { Button, Card, Radio, Statistic } from 'antd';
import { upperCase } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { switchMapTo, timer, takeWhile } from 'rxjs';
import { LONG_DURATION } from '../../../config';
import { useAccount, useApi, useIsMounted, useStaking, useStakingRewards } from '../../../hooks';
import { StakingHistory } from '../../../model';
import { fromWei, isRing, prettyNumber, rxPost } from '../../../utils';
import { StakingNow } from './StakingNow';

interface PowerDetailProps {
  updateEraIndex: (num: number) => void;
}

// eslint-disable-next-line no-magic-numbers
const RANGES = [2, 6, 18, 54, 162, 336];

export function Earnings({ updateEraIndex }: PowerDetailProps) {
  const { t } = useTranslation();
  const { network } = useApi();
  const [range, setRange] = useState<number>(RANGES[0]);
  const [claimed, setClaimed] = useState('-');
  const { assets } = useAccount();
  const { account } = useAccount();
  const { stashAccount } = useStaking();
  const {
    stakingRewards: { payoutTotal },
  } = useStakingRewards(range);
  const isMounted = useIsMounted();
  const ringAsset = useMemo(() => assets.find((item) => isRing(item.asset)), [assets]);

  useEffect(() => {
    const times = 3;
    const sub$$ = timer(0, LONG_DURATION * times)
      .pipe(
        takeWhile(() => isMounted),
        switchMapTo(
          rxPost<StakingHistory>({
            url: `https://${network.name}.webapi.subscan.io/api/scan/staking_history`,
            params: { page: 0, row: 10, address: account },
          })
        )
      )
      .subscribe((res) => {
        setClaimed(fromWei({ value: res.sum }, prettyNumber));
      });

    return () => sub$$.unsubscribe();
  }, [account, isMounted, network]);

  return !stashAccount ? (
    <Card className="my-8">
      <StakingNow />
    </Card>
  ) : (
    <>
      <Card className="my-8">
        <Radio.Group
          value={range}
          onChange={(event) => {
            const idx = Number(+event.target.value);

            setRange(idx);
            updateEraIndex(idx);
          }}
        >
          {RANGES.map((item, index) => (
            <Radio.Button value={item} key={index}>
              {t('{{count}} days', { count: item })}
            </Radio.Button>
          ))}
        </Radio.Group>
        <div className="flex justify-between items-center mt-8">
          <Statistic title={t('Claimed')} value={`${claimed} ${upperCase(ringAsset?.token.symbol)}`} />

          <Statistic
            title={t('Unclaimed')}
            value={`${fromWei({ value: payoutTotal })} ${upperCase(ringAsset?.token.symbol)}`}
          />

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
