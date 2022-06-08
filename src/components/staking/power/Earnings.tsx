import { Button, Card, Radio, Spin } from 'antd';
import { upperCase } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { switchMapTo, takeWhile, timer } from 'rxjs';
import { LONG_DURATION } from '../../../config';
import { useAccount, useApi, useIsMounted, useStaking, useStakingRewards } from '../../../hooks';
import { StakingHistory } from '../../../model';
import { fromWei, isRing, prettyNumber, rxPost } from '../../../utils';
import { Statistics } from '../../widget/Statistics';
import { SubscanLink } from '../../widget/SubscanLink';
import { ClaimRewards } from '../action';
import { StakingNow } from './StakingNow';

interface PowerDetailProps {
  updateEraIndex: (num: number) => void;
}

export function Earnings({ updateEraIndex }: PowerDetailProps) {
  const { t } = useTranslation();
  const { network } = useApi();
  const { assets, account } = useAccount();
  const { stashAccount } = useStaking();
  const [eraSelectionIndex, setEraSelectionIndex] = useState<number>(0);
  const [claimed, setClaimed] = useState('-');

  const {
    stakingRewards: { payoutTotal },
    eraSelection,
    isLoadingRewards,
  } = useStakingRewards(eraSelectionIndex);
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
            params: { page: 0, row: 10, address: account?.displayAddress || '' },
          })
        )
      )
      .subscribe((res) => {
        setClaimed(fromWei({ value: res.sum }, prettyNumber));
      });

    return () => sub$$.unsubscribe();
  }, [account, isMounted, network]);

  return !stashAccount ? (
    <Card className="my-8 shadow-xxl">
      <StakingNow />
    </Card>
  ) : (
    <Card className="my-8 shadow-xxl" bodyStyle={{ padding: '24px 32px' }}>
      <Radio.Group
        buttonStyle="solid"
        value={eraSelection[eraSelectionIndex].value}
        onChange={(event) => {
          const value = +event.target.value;
          const idx = eraSelection.findIndex((item) => item.value === value);

          setEraSelectionIndex(idx);
          updateEraIndex(idx);
        }}
        className="staking-earnings-time"
      >
        {eraSelection.map((item, index) => (
          <Radio.Button
            value={item.value}
            key={index}
            className={`staking-earnings-time-btn ${
              eraSelectionIndex === index ? 'staking-earnings-time-btn-checked-' + network.name : ''
            }`}
          >
            {item.text}
          </Radio.Button>
        ))}
      </Radio.Group>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-8">
        <Statistics title={t('Claimed')} value={`${claimed} ${upperCase(ringAsset?.token.symbol)}`} />

        <Statistics
          title={t('Unclaimed')}
          value={
            isLoadingRewards ? (
              <Spin />
            ) : (
              `${fromWei({ value: payoutTotal }, prettyNumber)} ${upperCase(ringAsset?.token.symbol)}`
            )
          }
        />

        <div className="flex items-center justify-center gap-4 mt-4 md:mt-0">
          <ClaimRewards eraSelectionIndex={eraSelectionIndex} type="primary" />
          <Button>
            <SubscanLink network={network.name} address={account?.displayAddress || ''} query="tab=reward">
              {t('Reward History')}
            </SubscanLink>
          </Button>
        </div>
      </div>
    </Card>
  );
}
