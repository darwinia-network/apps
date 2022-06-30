import type { Codec, IExtrinsic, IMethod, TypeDef } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';
import { useState, useEffect } from 'react';
import { Enum, getTypeDef } from '@polkadot/types';
import type { ExtrinsicSignature } from '@polkadot/types/interfaces';

import { Params } from './param/Params';

export interface Props {
  children?: React.ReactNode;
  className?: string;
  labelHash?: React.ReactNode;
  labelSignature?: React.ReactNode;
  mortality?: string;
  onError?: () => void;
  value: IExtrinsic | IMethod;
  withBorder?: boolean;
  withHash?: boolean;
  withSignature?: boolean;
  tip?: BN;
}

interface Param {
  name: string;
  type: TypeDef;
}

interface Value {
  isValid: boolean;
  value: Codec;
}

interface Extracted {
  hash: string | null;
  params: Param[];
  signature: string | null;
  signatureType: string | null;
  values: Value[];
}

function isExtrinsic(value: IExtrinsic | IMethod): value is IExtrinsic {
  return !!(value as IExtrinsic).signature;
}

// This is no doubt NOT the way to do things - however there is no other option
function getRawSignature(value: IExtrinsic): ExtrinsicSignature | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (value as any)._raw?.signature?.multiSignature as ExtrinsicSignature;
}

// eslint-disable-next-line complexity
function extractState(value: IExtrinsic | IMethod, withHash?: boolean, withSignature?: boolean): Extracted {
  const params = value.meta.args.map(
    ({ name, type }): Param => ({
      name: name.toString(),
      type: getTypeDef(type.toString()),
    })
  );
  const values = value.args.map(
    (value): Value => ({
      isValid: true,
      value,
    })
  );
  const hash = withHash ? value.hash.toHex() : null;
  let signature: string | null = null;
  let signatureType: string | null = null;

  if (withSignature && isExtrinsic(value) && value.isSigned) {
    const raw = getRawSignature(value);

    signature = value.signature.toHex();
    signatureType = raw instanceof Enum ? raw.type : null;
  }

  return { hash, params, signature, signatureType, values };
}

export const CallDisplay: React.FC<Props> = ({ value, withHash, withSignature, withBorder }) => {
  const [{ params, values }, setExtracted] = useState<Extracted>({
    hash: null,
    params: [],
    signature: null,
    signatureType: null,
    values: [],
  });

  useEffect((): void => {
    setExtracted(extractState(value, withHash, withSignature));
  }, [value, withHash, withSignature]);

  return (
    <div>
      <Params isDisabled params={params} registry={value.registry} values={values} withBorder={withBorder} />
    </div>
  );
};
