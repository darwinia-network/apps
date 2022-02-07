import { BN, bnToBn, BN_ONE, BN_THOUSAND, BN_TWO, extractTime } from '@polkadot/util';
import type { Time } from '@polkadot/util/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from './api';

type Result = [number, string, Time];

// eslint-disable-next-line no-magic-numbers
const DEFAULT_TIME = new BN(6_000);

// Some chains incorrectly use these, i.e. it is se to values such as 0 or even 2
// Use a low minimum validity threshold to check these against
const THRESHOLD = BN_THOUSAND.div(BN_TWO);

export function useBlockTime(blocks: number | BN = BN_ONE): Result {
  const { t } = useTranslation();
  const { api } = useApi();

  // eslint-disable-next-line complexity
  return useMemo((): Result => {
    const blockTime =
      api.consts.babe?.expectedBlockTime ||
      api.consts.difficulty?.targetBlockTime ||
      api.consts.subspace?.expectedBlockTime ||
      (api.consts.timestamp?.minimumPeriod.gte(THRESHOLD)
        ? api.consts.timestamp.minimumPeriod.mul(BN_TWO)
        : api.query.parachainSystem
        ? DEFAULT_TIME.mul(BN_TWO)
        : DEFAULT_TIME);

    const value = blockTime.mul(bnToBn(blocks)).toNumber();
    const time = extractTime(Math.abs(value));
    const { days, hours, minutes, seconds } = time;
    const timeStr = [
      days ? (days > 1 ? t<string>('{{days}} days', { replace: { days } }) : t<string>('1 day')) : null,
      hours ? (hours > 1 ? t<string>('{{hours}} hrs', { replace: { hours } }) : t<string>('1 hr')) : null,
      minutes ? (minutes > 1 ? t<string>('{{minutes}} mins', { replace: { minutes } }) : t<string>('1 min')) : null,
      seconds ? (seconds > 1 ? t<string>('{{seconds}} s', { replace: { seconds } }) : t<string>('1 s')) : null,
    ]
      .filter((s): s is string => !!s)
      // eslint-disable-next-line no-magic-numbers
      .slice(0, 2)
      .join(' ');

    return [blockTime.toNumber(), `${value < 0 ? '+' : ''}${timeStr}`, time];
  }, [api, blocks, t]);
}
