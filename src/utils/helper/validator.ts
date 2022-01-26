import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { hexToU8a, isHex } from '@polkadot/util';
import BN from 'bn.js';
import type { ValidatorRule } from 'rc-field-form/lib/interface';
import { TFunction } from 'react-i18next';
import { Network, NetworkCategory, PolkadotChainConfig, Token } from '../../model';
import { NETWORK_CONFIGURATIONS } from '../network';
import { convertToSS58 } from './address';
import { getUnit, toWei } from './balance';

// eslint-disable-next-line complexity
export const isValidAddress = (address: string, network: Network | NetworkCategory, strict = false): boolean => {
  const target = NETWORK_CONFIGURATIONS.find((item) => item.name === network) as PolkadotChainConfig;

  return strict ? isSS58Address(address, target.ss58Prefix) : isSS58Address(address);
};

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
  const { compared = '0', token } = options;
  const max = new BN(compared as string);
  const value = new BN(toWei({ value: val, unit: getUnit(Number(token?.decimal)) ?? 'gwei' }));

  return value.gt(max) ? Promise.reject() : Promise.resolve();
};

export const insufficientBalanceRule: ValidatorRuleFactory = (options) => {
  const { t } = options;
  const validator = insufficientBalanceValidatorFactory(options);

  return { validator, message: t('Insufficient balance') };
};
