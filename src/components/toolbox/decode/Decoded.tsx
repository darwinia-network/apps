import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { Inspect } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import { u8aToHex } from '@polkadot/util';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from 'antd';

import { Output } from '../../widget/Output';
import { DecodedInspect } from './DecodedInspect';

interface Props {
  className?: string;
  isCall: boolean;
  withData?: boolean;
  withHash?: boolean;
  extrinsic?: SubmittableExtrinsic<'promise'> | null;
}

const extract = (
  isCall: boolean,
  extrinsic?: SubmittableExtrinsic<'promise'> | null
): [HexString, HexString, Inspect | null] => {
  if (!extrinsic) {
    return ['0x', '0x', null];
  }

  const u8a = extrinsic.method.toU8a();

  // don't use the built-in hash, we only want to convert once
  return [
    u8aToHex(u8a),
    extrinsic.registry.hash(u8a).toHex(),
    isCall ? extrinsic.method.inspect() : extrinsic.inspect(),
  ];
};

export const Decoded: React.FC<Props> = ({ extrinsic, className, isCall, withData = true, withHash = true }) => {
  const { t } = useTranslation();
  const [hex, hash, inspect] = useMemo(() => extract(isCall, extrinsic), [extrinsic, isCall]);

  if (!inspect) {
    return null;
  }

  return (
    <div className={`mt-2 grid grid-cols-2 gap-x-2 ${className}`}>
      <div className="flex flex-col">
        {withData && (
          <Output label={t('encoded call data')}>
            <Typography.Text copyable>{hex}</Typography.Text>
          </Output>
        )}
        {withHash && (
          <Output label={t('encoded call hash')}>
            <Typography.Text copyable>{hash}</Typography.Text>
          </Output>
        )}
      </div>
      <div className="flex flex-col">
        <DecodedInspect hex={hex} inspect={inspect} label={t('encoding details')} />
      </div>
    </div>
  );
};
