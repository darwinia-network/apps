// Copyright 2017-2020 @polkadot/react-components authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { KTON_PROPERTIES, RING_PROPERTIES } from '@polkadot/react-darwinia';
import { currencyType } from '@polkadot/react-darwinia/types';
import { formatBalance, formatKtonBalance } from '@polkadot/util';
import { BalanceFormatter, SiDef } from '@polkadot/util/types';
import BN from 'bn.js';
import React, { useEffect, useState } from 'react';
import { BitLengthOption } from './constants';
// import Button from './Button';
import Dropdown from './Dropdown';
import Input, { KEYS, KEYS_PRE } from './Input';
import { useTranslation } from './translate';
import { BareProps, BitLength } from './types';
import { classes } from './util';

interface Props extends BareProps {
  autoFocus?: boolean;
  bitLength?: BitLength;
  defaultValue?: BN | string;
  help?: React.ReactNode;
  isDisabled?: boolean;
  isError?: boolean;
  isFull?: boolean;
  isSi?: boolean;
  isSiShow?: boolean;
  isType?: boolean;
  isDecimal?: boolean;
  isZeroable?: boolean;
  label?: React.ReactNode;
  labelExtra?: React.ReactNode;
  maxLength?: number;
  maxValue?: BN;
  onChange?: (value?: BN) => void;
  onChangeType?: (value?: string) => void;
  onEnter?: () => void;
  onEscape?: () => void;
  placeholder?: string;
  value?: BN | string;
  withEllipsis?: boolean;
  withLabel?: boolean;
  withMax?: boolean;
  currencyType?: currencyType;
}

const DEFAULT_BITLENGTH = BitLengthOption.NORMAL_NUMBERS as BitLength;
const ZERO = new BN(0);
const TEN = new BN(10);

export class TokenUnit {
  public static abbr = 'Unit';

  public static setAbbr (abbr: string = TokenUnit.abbr): void {
    TokenUnit.abbr = abbr;
  }
}

export class TokenKtonUnit {
  public static abbr = 'Unit';

  public static setAbbr (abbr: string = TokenKtonUnit.abbr): void {
    TokenKtonUnit.abbr = abbr;
  }
}

function getGlobalMaxValue (bitLength?: number): BN {
  return new BN(2).pow(new BN(bitLength || DEFAULT_BITLENGTH)).subn(1);
}

function getRegex (isDecimal: boolean): RegExp {
  return new RegExp(
    isDecimal
      ? `^(0|[1-9]\\d*)(\\${KEYS.DECIMAL}\\d*)?$`
      : '^(0|[1-9]\\d*)$'
  );
}

function getFormat (currencyType: currencyType = 'ring'): BalanceFormatter {
  return currencyType === 'kton' ? formatKtonBalance : formatBalance;
}

function getSiOptions (currencyType: currencyType): { text: string; value: string }[] {
  return getFormat(currencyType).getOptions()
    .map(({ power, text, value }): { text: string; value: string } => ({
      value,
      text: power === 0
        ? currencyType === 'kton' ? TokenKtonUnit.abbr : TokenUnit.abbr
        : text
    }));
}

function getSiPowers (si: SiDef | null, currencyType: currencyType): [BN, number, number] {
  if (!si) {
    return [ZERO, 0, 0];
  }

  const basePower = getFormat(currencyType).getDefaults().decimals;

  return [new BN(basePower + si.power), basePower, si.power];
}

function isValidNumber (bn: BN, { bitLength = DEFAULT_BITLENGTH, isZeroable, maxValue }: Props): boolean {
  if (
    // cannot be negative
    bn.lt(ZERO) ||
    // cannot be > than allowed max
    !bn.lt(getGlobalMaxValue(bitLength)) ||
    // check if 0 and it should be a value
    (!isZeroable && bn.eq(ZERO)) ||
    // check that the bitlengths fit
    bn.bitLength() > (bitLength || DEFAULT_BITLENGTH) ||
    // cannot be > max (if specified)
    (maxValue && maxValue.gtn(0) && bn.gt(maxValue))
  ) {
    return false;
  }

  return true;
}

function inputToBn (input: string, si: SiDef | null, props: Props, currencyType: currencyType): [BN, boolean] {
  /**
   * results of BN do not match expectations when using thousandths numbers
   * new BN(10232.23).toString() ---> 10232  ???
   * new BN(10,232.23).toString() ---> 10 x
   */
  input = input.replace(',', '');
  const [siPower, basePower, siUnitPower] = getSiPowers(si, currencyType);

  // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
  const isDecimalValue = input.match(/^(\d+)\.(\d+)$/);

  let result;

  if (isDecimalValue) {
    if (siUnitPower - isDecimalValue[2].length < -basePower) {
      result = new BN(-1);
    }

    const div = new BN(input.replace(/\.\d*$/, ''));
    const modString = input.replace(/^\d+\./, '');
    const mod = new BN(modString);

    result = div
      .mul(TEN.pow(siPower))
      .add(mod.mul(TEN.pow(new BN(basePower + siUnitPower - modString.length))));
  } else {
    result = new BN(input.replace(/[^\d]/g, ''))
      .mul(TEN.pow(siPower));
  }

  return [
    result,
    isValidNumber(result, props)
  ];
}

// function bnToInput (bn: BN, si: SiDef | null): string {
//   const [siPower] = getSiPowers(si);
//
//   const base = TEN.pow(siPower);
//   const div = bn.div(base);
//   const mod = bn.mod(base);
//
//   return `${
//     div.gt(ZERO) ? div.toString() : '0'
//   }${
//     mod.gt(ZERO)
//       ? ((): string => {
//         const padding = Math.max(
//           mod.toString().length,
//           base.toString().length - div.toString().length,
//           bn.toString().length - div.toString().length
//         );
//
//         return `.${mod.toString(10, padding).replace(/0*$/, '')}`;
//       })()
//       : ''
//   }`;
// }

function getValuesFromString (value: string, si: SiDef | null, props: Props, currencyType: currencyType): [string, BN, boolean] {
  const [valueBn, isValid] = inputToBn(value, si, props, currencyType);

  return [
    value,
    valueBn,
    isValid
  ];
}

function getValuesFromBn (valueBn: BN, si: SiDef | null): [string, BN, boolean] {
  const value = si
    ? valueBn.div(TEN.pow(new BN(si.power))).toString()
    : valueBn.toString();

  return [
    value,
    valueBn,
    true
  ];
}

function getValues (value: BN | string, si: SiDef | null, props: Props, currencyType: currencyType): [string, BN, boolean] {
  return BN.isBN(value)
    ? getValuesFromBn(value, si)
    : getValuesFromString(value, si, props, currencyType);
}

function isNewPropsValue (propsValue: BN | string, value: string, valueBn: BN): boolean {
  return BN.isBN(propsValue) ? !propsValue.eq(valueBn) : propsValue !== value;
}

export default function InputNumber (props: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { bitLength = DEFAULT_BITLENGTH, className, defaultValue = ZERO, help, isDecimal, isFull, isSi = true, isDisabled, isError = false, maxLength, maxValue, onChange, onEnter, onEscape, placeholder, style, value: propsValue, isType, isSiShow = true, currencyType } = props;

  const [si, setSi] = useState<SiDef | null>(isSi ? getFormat(currencyType).findSi('-') : null);
  const [type, setType] = useState('ring');
  const [isPreKeyDown, setIsPreKeyDown] = useState(false);

  const [[value, valueBn, isValid], setValues] = useState<[string, BN, boolean]>(
    getValues(propsValue || defaultValue, si, props, currencyType)
  );

  useEffect((): void => {
    if (propsValue && isNewPropsValue(propsValue, value, valueBn)) {
      setValues(getValues(propsValue, si, props, currencyType));
    }
  }, [propsValue]);

  useEffect((): void => {
    setValues(getValues(value, si, props, currencyType));
  }, [value, si, bitLength, maxValue]);

  useEffect((): void => {
    onChange && onChange(valueBn);
  }, [valueBn]);

  const _onChange = (input: string): void => {
    setValues(getValuesFromString(input, si, props, currencyType));
  };

  const _onKeyDown = (event: React.KeyboardEvent<Element>): void => {
    if (KEYS_PRE.includes(event.key)) {
      setIsPreKeyDown(true);

      return;
    }

    if (event.key.length === 1 && !isPreKeyDown) {
      const { selectionEnd: j, selectionStart: i, value } = event.target as HTMLInputElement;
      const newValue = `${value.substring(0, i || 0)}${event.key}${value.substring(j || 0)}`;

      if (!getRegex(isDecimal || !!si).test(newValue)) {
        event.preventDefault();
      }
    }
  };

  const selectType = (type: string): void => {
    const { onChangeType } = props;

    onChangeType && onChangeType(type);
    setType(type);
  };

  const renderTypeDropdown = (): React.ReactElement => {
    const typeOptions = [{
      text: RING_PROPERTIES.tokenSymbol,
      value: 'ring'
    }, {
      text: KTON_PROPERTIES.tokenSymbol,
      value: 'kton'
    }];

    return (
      <Dropdown
        defaultValue={type}
        dropdownClassName='ui--TypeDropdown'
        isButton
        onChange={selectType}
        options={typeOptions}
      />
    );
  };

  const _onKeyUp = (event: React.KeyboardEvent<Element>): void => {
    if (KEYS_PRE.includes(event.key)) {
      setIsPreKeyDown(false);
    }
  };

  const _onPaste = (event: React.ClipboardEvent<Element>): void => {
    const { value: newValue } = event.target as HTMLInputElement;

    if (!getRegex(isDecimal || !!si).test(newValue)) {
      event.preventDefault();
    }
  };

  const _onSelectSiUnit = (siUnit: string): void => {
    setSi(getFormat(currencyType).findSi(siUnit));
  };

  // const _onClickMaxButton = (): void => {
  //   !!maxValue && setValue(bnToInput(maxValue, si));
  // };

  const maxValueLength = getGlobalMaxValue(bitLength).toString().length - 1;

  return (
    <Input
      {...props}
      className={classes('ui--InputNumber', className)}
      help={help}
      isAction={isSi}
      isDisabled={isDisabled}
      isError={!isValid || isError}
      isFull={isFull}
      maxLength={maxLength || maxValueLength}
      onChange={_onChange}
      onEnter={onEnter}
      onEscape={onEscape}
      onKeyDown={_onKeyDown}
      onKeyUp={_onKeyUp}
      onPaste={_onPaste}
      placeholder={placeholder || t('Positive number')}
      style={style}
      type='text'
      value={value}
    >
      {/* (ALLOW_MAX && withMax && !!maxValue && valueBn.lt(maxValue)) && (
        <Button
          className='ui--MaxButton'
          icon=''
          onClick={_onClickMaxButton}
        >
          {t('Max')}
        </Button>
      ) */}
      {!!isSiShow && (
        <Dropdown
          defaultValue={si.value}
          dropdownClassName='ui--SiDropdown'
          isButton
          onChange={_onSelectSiUnit}
          options={getSiOptions(currencyType)}
        />
      )}
      {isType && renderTypeDropdown()}

    </Input>
  );
}
