import type { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { RuntimeDispatchInfo } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';
import React, { useEffect, useState } from 'react';
import { formatBalance, isFunction } from '@polkadot/util';
import { useTranslation, Trans } from 'react-i18next';
import { from } from 'rxjs';
import { Alert } from 'antd';
import { useApi, useIsMounted } from '../../hooks';

interface Props {
  accountId: string | null;
  extrinsic?: SubmittableExtrinsic | null;
  isSendable: boolean;
  onChange?: (hasAvailable: boolean) => void;
  tip?: BN;
}

// eslint-disable-next-line complexity
export const PaymentInfo: React.FC<Props> = ({ accountId, extrinsic }) => {
  const { t } = useTranslation();
  const { api } = useApi();
  const [dispatchInfo, setDispatchInfo] = useState<RuntimeDispatchInfo | null>(null);
  const isMounted = useIsMounted();
  const [balances, setBalances] = useState<DeriveBalancesAll>();

  useEffect(() => {
    if (!accountId) {
      return;
    }
    const sub$$ = from(api.derive.balances?.all(accountId)).subscribe(setBalances);
    return () => sub$$.unsubscribe();
  }, [accountId, api]);

  useEffect((): void => {
    accountId &&
      extrinsic &&
      isFunction(extrinsic.paymentInfo) &&
      isFunction(api.rpc.payment?.queryInfo) &&
      setTimeout((): void => {
        try {
          extrinsic
            .paymentInfo(accountId)
            .then((info) => isMounted && setDispatchInfo(info))
            .catch(console.error);
        } catch (error) {
          console.error(error);
        }
      }, 0);
  }, [api, accountId, extrinsic, isMounted]);

  if (!dispatchInfo || !extrinsic) {
    return null;
  }

  const isFeeError =
    api.consts.balances &&
    !api.tx.balances?.transfer.is(extrinsic) &&
    balances?.accountId.eq(accountId) &&
    (balances.availableBalance.lte(dispatchInfo.partialFee) ||
      balances.freeBalance.sub(dispatchInfo.partialFee).lte(api.consts.balances.existentialDeposit));

  return (
    <div>
      <Trans i18nKey="feesForSubmission">
        Fees of <span className="highlight">{formatBalance(dispatchInfo.partialFee, { withSiFull: true })}</span> will
        be applied to the submission
      </Trans>
      {!isFeeError && (
        <Alert
          type="warning"
          message={t<string>(
            'The account does not have enough free funds (excluding locked/bonded/reserved) available to cover the transaction fees without dropping the balance below the account existential amount.'
          )}
        />
      )}
    </div>
  );
};
