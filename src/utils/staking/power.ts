import { Balance } from '@polkadot/types/interfaces';
import Bignumber from 'bignumber.js';
import BN from 'bn.js';

const ZERO = new Bignumber(0);
export const POWER_CAP = 1000000000;

// eslint-disable-next-line complexity
export function assetToPower(
  ringAmount: BN | Balance,
  ktonAmount: BN | Balance,
  ringPool: BN | Balance,
  ktonPool: BN | Balance
) {
  if (!ringPool || (ringPool && ringPool.toString() === '0')) {
    return ZERO;
  }

  let div = new Bignumber(0);

  //  (ring + (kton * (ringPool / KtonPool))) / (ringPool * 2) * 100000
  if (ktonPool && ktonPool.toString() !== '0') {
    div = new Bignumber(ringPool.toString()).div(new Bignumber(ktonPool.toString()));
  }

  return new Bignumber(
    new Bignumber(ringAmount.toString())
      .plus(new Bignumber(ktonAmount.toString()).times(div))
      // eslint-disable-next-line no-magic-numbers
      .div(new Bignumber(ringPool.toString()).times(2))
      .times(POWER_CAP)
      .toFixed(0)
  );
}

// eslint-disable-next-line complexity
export function bondedToPower(bondedAmount: Balance, ringPool: Balance) {
  if (
    !ringPool ||
    (ringPool && ringPool.toString() === '0') ||
    !bondedAmount ||
    (bondedAmount && bondedAmount.toString() === '0')
  ) {
    return ZERO;
  }

  return new Bignumber(
    // eslint-disable-next-line no-magic-numbers
    new Bignumber(bondedAmount.toString()).div(new Bignumber(ringPool.toString()).times(2)).times(POWER_CAP).toFixed(0)
  );
}
