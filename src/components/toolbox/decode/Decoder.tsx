import { Input, Form, Card } from 'antd';
import { useTranslation } from 'react-i18next';
import { assert, isHex } from '@polkadot/util';
import type { SubmittableExtrinsic, SubmittableExtrinsicFunction } from '@polkadot/api/types';
import type { Call } from '@polkadot/types/interfaces';
import { useCallback, useState } from 'react';

import { useApi } from '../../../hooks';
import { Label } from '../../widget/form-control/Label';
import { DisplayExtrinsic } from '../../widget/DisplayExtrinsic';
import { CallDisplay } from '../../widget/CallDisplay';
import { Decoded } from './Decoded';

interface ExtrinsicInfo {
  decoded: SubmittableExtrinsic<'promise'> | null;
  extrinsicCall: Call | null;
  extrinsicError: string | null;
  extrinsicFn: SubmittableExtrinsicFunction<'promise'> | null;
  extrinsicHex: string | null;
  extrinsicKey: string;
  isCall: boolean;
}

const DEFAULT_INFO: ExtrinsicInfo = {
  decoded: null,
  extrinsicCall: null,
  extrinsicError: null,
  extrinsicFn: null,
  extrinsicHex: null,
  extrinsicKey: 'none',
  isCall: true,
};

export const Decoder = () => {
  const { api } = useApi();
  const { t } = useTranslation();
  const [{ decoded, extrinsicCall, extrinsicError, extrinsicFn, extrinsicKey, isCall }, setExtrinsicInfo] =
    useState<ExtrinsicInfo>(DEFAULT_INFO);

  void decoded;
  void extrinsicCall;
  void extrinsicFn;
  void extrinsicKey;

  const handleCallDataChange = useCallback(
    ({ callData: hex }) => {
      try {
        assert(isHex(hex), t('Expected a hex-encoded call'));

        let isCall = true;
        let extrinsicCall: Call;
        let decoded: SubmittableExtrinsic<'promise'> | null = null;

        try {
          // cater for an extrinsic input...
          decoded = api.tx(hex);
          extrinsicCall = api.createType('Call', decoded.method);
          isCall = false;
        } catch (e) {
          extrinsicCall = api.createType('Call', hex);
        }

        const { method, section } = api.registry.findMetaCall(extrinsicCall.callIndex);
        const extrinsicFn = api.tx[section][method];
        const extrinsicKey = extrinsicCall.callIndex.toString();

        if (!decoded) {
          decoded = extrinsicFn(...extrinsicCall.args);
        }

        setExtrinsicInfo({
          ...DEFAULT_INFO,
          decoded,
          extrinsicCall,
          extrinsicFn,
          extrinsicHex: hex,
          extrinsicKey,
          isCall,
        });
      } catch (err) {
        setExtrinsicInfo({ ...DEFAULT_INFO, extrinsicError: (err as Error).message });
      }
    },
    [api, t]
  );

  return (
    <Form<{ callData: string }> layout="vertical" onValuesChange={handleCallDataChange} className="max-w-8xl">
      <Form.Item
        label={<Label text={t('Hex-encoded call')} />}
        name="callData"
        help={<span className="text-red-500">{extrinsicError}</span>}
      >
        <Input size="large" placeholder="0x" />
      </Form.Item>

      {decoded && (
        <Form.Item label={<Label text={t('Decoded result')} />} name="result">
          <Card>
            {extrinsicFn && extrinsicCall && (
              <>
                <DisplayExtrinsic defaultValue={extrinsicFn} label={t('decoded call')} />
                <CallDisplay value={extrinsicCall} />
              </>
            )}
            <Decoded extrinsic={decoded} isCall={isCall} withData={false} />
          </Card>
        </Form.Item>
      )}
    </Form>
  );
};
