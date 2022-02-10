import { DeriveStakingOverview } from '@polkadot/api-derive/staking/types';
import { Card, Skeleton } from 'antd';
import { useEffect, useState } from 'react';
import { from } from 'rxjs';
import { useApi, useIsMountedOperator, useStaking } from '../../../hooks';
import { Validators } from './Validators';

export function Waiting() {
  const { api } = useApi();
  const { stashAccount } = useStaking();
  const [overview, setOverview] = useState<DeriveStakingOverview | null>(null);
  const { takeWhileIsMounted } = useIsMountedOperator();

  useEffect(() => {
    const sub$$ = from(api.derive.staking.overview())
      .pipe(takeWhileIsMounted())
      .subscribe((res) => {
        setOverview(res);
      });

    return () => {
      sub$$.unsubscribe();
    };
  }, [api, stashAccount, takeWhileIsMounted]);

  return overview ? (
    <Validators overview={overview} />
  ) : (
    <Card>
      <Skeleton active />
    </Card>
  );
}
