import React from 'react';
import { BN } from '@polkadot/util';
import { useTranslation } from 'react-i18next';
import { QueueTx } from '../../model';
import { Expander } from './Expander';
import { PaymentInfo } from './PaymentInfo';

interface Props {
  accountId: string | null;
  className?: string;
  currentItem: QueueTx;
  isSendable: boolean;
  onError: () => void;
  tip?: BN;
}

export const Transaction: React.FC<Props> = ({
  accountId,
  currentItem: { extrinsic, isUnsigned, payload },
  isSendable,
  tip,
}) => {
  const { t } = useTranslation();

  if (!extrinsic) {
    return null;
  }

  const { meta, method, section } = extrinsic.registry.findMetaCall(extrinsic.callIndex);
  const args = meta?.args.map(({ name }) => name).join(', ') || '';

  return (
    <div>
      <Expander
        summary={
          <>
            {t<string>('Sending transaction')}{' '}
            <span>
              {section}.{method}({args})
            </span>
          </>
        }
        summaryMeta={meta}
      >
        {/*  */}
      </Expander>
      {!isUnsigned && !payload && (
        <PaymentInfo accountId={accountId} extrinsic={extrinsic} isSendable={isSendable} tip={tip} />
      )}
    </div>
  );
};
