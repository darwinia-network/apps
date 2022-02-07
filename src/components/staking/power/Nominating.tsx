import { Power } from '@darwinia/types';
import Identicon from '@polkadot/react-identicon';
import { Card, Empty } from 'antd';
import { isNull } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from, takeWhile } from 'rxjs';
import { DeriveStakingQuery } from '../../../api-derive/types';
import { useApi, useIsMounted, useNominators, useStaking } from '../../../hooks';
import { AccountName } from '../../widget/AccountName';

interface NominateItemProps {
  source: [string, Power | null][];
}

function NominateItem({ source }: NominateItemProps) {
  const { t } = useTranslation();

  if (!source.length) {
    return <Empty />;
  }

  return (
    <>
      {source.map(([account, power], index) => (
        <div className="flex justify-between items-center border-b py-2" key={index}>
          <div className="flex items-center gap-2">
            <Identicon value={account} size={32} className="rounded-full border p-1" />
            <AccountName account={account} />
          </div>
          <span>{t('{{amount}} Powder', { amount: isNull(power) ? 0 : power })}</span>
        </div>
      ))}
    </>
  );
}

function Nominators() {
  const { nominators } = useNominators();

  return <NominateItem source={nominators ?? []} />;
}

function Nominees() {
  const { api } = useApi();
  const { stashAccount, stakingDerive } = useStaking();
  const [nominees, setNominees] = useState<[string, Power | null][]>([]);
  const isMounted = useIsMounted();

  useEffect(() => {
    if (!stakingDerive?.nominators) {
      return;
    }

    const accounts = stakingDerive.nominators.map((item) => item.toString());
    from(api.derive.staking.queryMulti(accounts, { withLedger: true }) as unknown as Promise<DeriveStakingQuery[]>)
      .pipe(takeWhile(() => isMounted))
      .subscribe((res) => {
        const exps = res.map((item) => {
          const { exposure } = item;

          return exposure ? exposure.others.filter((exp) => exp.who.eq(stashAccount))[0] : null;
        });

        setNominees(accounts.map((account, index) => [account, exps[index]?.power ?? null]));
      });
  }, [api, isMounted, stakingDerive, stashAccount]);

  return <NominateItem source={nominees} />;
}

export function Nominating() {
  const { t } = useTranslation();
  const { isValidating, isNominating } = useStaking();

  return (
    <Card>
      <h1 className="text-lg font-bold">{t('Nominating')}</h1>

      {isNominating && (
        <p className="text-sx my-4 text-gray-400">
          {t('Your nomination will take effect in the next era. Before that, the POWER may be displayed as 0')}
        </p>
      )}

      {isValidating && <Nominators />}

      {isNominating && <Nominees />}
    </Card>
  );
}
