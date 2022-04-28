import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { hexToU8a, isHex, BN } from '@polkadot/util';
import type { ValidatorRule } from 'rc-field-form/lib/interface';
import { TFunction } from 'react-i18next';
import { from, forkJoin } from 'rxjs';
import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { Option } from '@polkadot/types';
import type { AccountId, StakingLedger } from '@polkadot/types/interfaces';
import { ApiPromise } from '@polkadot/api';
import { Token } from '../../model';
import { convertToSS58 } from './address';
import { getUnit, toWei } from './balance';

export function isSpecifiedSS58Address(address: string, sst8Prefix: number) {
  return isSS58Address(address, sst8Prefix);
}

// eslint-disable-next-line complexity
export const isSS58Address = (address: string, ss58Prefix?: number) => {
  const len = 48;

  if (!address || address.length < len) {
    return false;
  }

  try {
    encodeAddress(
      isHex(address)
        ? hexToU8a(address)
        : ss58Prefix
        ? decodeAddress(address, false, ss58Prefix)
        : decodeAddress(address)
    );

    return true;
  } catch (error) {
    return false;
  }
};

// eslint-disable-next-line complexity
export const isSameAddress = (from: string, to: string): boolean => {
  if (from === to) {
    return true;
  }

  const toAddress = convertToSS58(to, 0);
  const fromAddress = convertToSS58(from, 0);

  return fromAddress === toAddress;
};

export const isRing = (name: string | null | undefined) => /ring/i.test(String(name)) || /crab/i.test(String(name));

export const isKton = (name: string | null | undefined) => /kton/i.test(String(name));

export const isDeposit = (name: string | null | undefined) => /deposit/i.test(String(name));

/* ------------------------------------Form Validators------------------------------------- */

export type Validator = ValidatorRule['validator'];

export interface ValidateOptions {
  t: TFunction;
  compared?: string | BN | number | null;
  token?: Token;
  asset?: string;
  valueKey?: string;
}

export type ValidatorFactory = (options: ValidateOptions) => Validator;

export type ValidatorRuleFactory = (options: ValidateOptions) => ValidatorRule;

const zeroAmountValidator: Validator = (_o, val) => {
  return new BN(val).isZero() ? Promise.reject() : Promise.resolve();
};

export const zeroAmountRule: ValidatorRuleFactory = (options) => {
  const { t } = options;

  return { validator: zeroAmountValidator, message: t('The transfer amount must great than 0') };
};

const insufficientBalanceValidatorFactory: ValidatorFactory = (options) => (_, val) => {
  const { compared = '0', token, valueKey = 'amount' } = options;
  const max = new BN(compared as string);
  const current = typeof val === 'object' ? val[valueKey] : val;
  const value = new BN(toWei({ value: current, unit: getUnit(Number(token?.decimal)) ?? 'gwei' }));

  return value.gt(max) ? Promise.reject() : Promise.resolve();
};

export const insufficientBalanceRule: ValidatorRuleFactory = (options) => {
  const { t } = options;
  const validator = insufficientBalanceValidatorFactory(options);

  return { validator, message: t('Insufficient balance') };
};

export const validateController = (
  api: ApiPromise,
  t: TFunction,
  accountId: string,
  controllerId: string,
  defaultControllerId: string
) => {
  return new Promise<string | void>((resolve, reject) => {
    const sub$$ = forkJoin(
      [
        from(api.query.staking.bonded(controllerId) as Promise<Option<AccountId>>),
        from(api.query.staking.ledger(controllerId) as Promise<Option<StakingLedger>>),
        from(api.derive.balances?.all(controllerId)),
      ],
      (bonded, ledger, all) =>
        [
          bonded.isSome ? bonded.unwrap().toString() : null,
          ledger.isSome ? ledger.unwrap().stash.toString() : null,
          all,
        ] as [string | null, string | null, DeriveBalancesAll | null]
      // eslint-disable-next-line complexity
    ).subscribe(([bondedId, stashId, allBalances]) => {
      sub$$.unsubscribe();

      if (controllerId === defaultControllerId) {
        resolve();
      } else if (bondedId && controllerId !== accountId) {
        reject(t('The account is a stash, controlled by {{bondedId}}', { replace: { bondedId } }));
      } else if (stashId) {
        reject(t('The account is already controlling {{stashId}}', { replace: { stashId } }));
      } else if (allBalances?.freeBalance.isZero()) {
        reject(t('The account does not have sufficient funds available to cover transaction fees'));
      } else {
        resolve();
      }
    });
  });
};
