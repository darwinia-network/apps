import { MailOutlined } from '@ant-design/icons';
import { DeriveHeartbeats } from '@polkadot/api-derive/types';
import { Power } from '@darwinia/types';
import { EraRewardPoints, Perbill } from '@polkadot/types/interfaces';
import { BN_ZERO } from '@polkadot/util';
import { Tag } from 'antd';
import { useMemo } from 'react';
import { getAddressMeta, isSameAddress, prettyNumber } from '../../../utils';
import { IdentAccountAddress } from '../../widget/account/IdentAccountAddress';
import { IdentAccountName } from '../../widget/account/IdentAccountName';
import { Favorite } from '../../widget/Favorite';
import { useOverview } from './overview';

export function Account({ account, heartbeats }: { account: string; heartbeats: DeriveHeartbeats | null }) {
  const count = heartbeats?.[account]?.blockCount.toNumber();
  const hasMsg = heartbeats?.[account]?.hasMessage;

  return (
    <>
      <Favorite account={account} />

      <div className="w-8">
        {!!count && <Tag color="cyan">{count}</Tag>}
        {!count && hasMsg && <MailOutlined color="cyan" />}
      </div>

      <IdentAccountName account={account} />
    </>
  );
}

export function StakerOther() {
  const { stakingInfo } = useOverview();

  const count = useMemo(() => {
    const { exposure } = stakingInfo;
    const other = exposure?.totalPower.sub(exposure.ownPower);

    return other || BN_ZERO;
  }, [stakingInfo]);

  const nominators = useMemo(() => stakingInfo.exposure?.others.map((item) => item.who.toString()), [stakingInfo]);

  if (count?.lte(BN_ZERO)) {
    return null;
  }

  return (
    <span>
      {prettyNumber(count)} {`(${nominators?.length})`}
    </span>
  );
}

export function Nominators({ data }: { data?: [string, number][] }) {
  const { stakingInfo } = useOverview();
  const nominators = useMemo<[string, Power][]>(
    () => stakingInfo.exposure?.others.map((item) => [item.who.toString(), item.power]) || [],
    [stakingInfo.exposure?.others]
  );

  return (
    <span className="grid grid-cols-4 items-center gap-4 bg-white p-4 rounded-lg">
      {(data || nominators)?.map(([acc]) => {
        const meta = getAddressMeta(acc);

        return (
          <IdentAccountAddress key={acc} account={{ address: acc, meta: { ...meta, source: '' } }} iconSize={24} />
        );
      })}
    </span>
  );
}

export function StakerOwn() {
  const { stakingInfo } = useOverview();
  const count = useMemo(() => {
    const { exposure } = stakingInfo;

    return exposure?.ownPower;
  }, [stakingInfo]);

  return !count || count.lt(BN_ZERO) ? null : <span>{prettyNumber(count)}</span>;
}

function Commission({ value }: { value: Perbill | null | undefined }) {
  const base = 10_000_000;
  const decimal = 2;
  const percent = value ? (value.toNumber() / base).toFixed(decimal) + '%' : '-';

  return <span>{percent}</span>;
}

export function ActiveCommission() {
  const { validatorPrefs } = useOverview();

  return <Commission value={validatorPrefs.commission.unwrap()} />;
}

export function NextCommission() {
  const { stakingInfo } = useOverview();

  return <Commission value={stakingInfo.validatorPrefs?.commission.unwrap() ?? null} />;
}

export function Points({ points, account }: { points: EraRewardPoints | null; account: string }) {
  if (!points) {
    return null;
  }

  const entry = [...points.individual.entries()].find(([address]) => isSameAddress(address.toString(), account));

  if (!entry) {
    return null;
  }

  return <span>{entry[1].toString()}</span>;
}
