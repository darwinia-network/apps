import { Button } from 'antd';
import { BN } from '@polkadot/util';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi, useStaking, useAccount } from '../../../hooks';
import { Fund } from '../../../model';
import { getUnit, getLedger, isRing, toWei, prettyNumber, fromWei } from '../../../utils';
import { FormModal } from '../../widget/FormModal';
import { AddressItem } from '../../widget/form-control/AddressItem';
import { FundItem } from '../../widget/form-control/FundItem';
import { Label } from '../../widget/form-control/Label';
import { StakingActionProps } from './interface';

interface RebondFormValues {
  stash: string;
  fund: Fund;
  [key: string]: unknown;
}

export function Rebond({ type = 'text', className = '', size }: StakingActionProps) {
  const { t } = useTranslation();
  const { api } = useApi();
  const { assets } = useAccount();
  const [isVisible, setIsVisible] = useState(false);
  const {
    stashAccount,
    controllerAccount,
    stakingDerive,
    isStakingLedgerEmpty,
    updateValidators,
    updateStakingDerive,
  } = useStaking();

  const ledgers = useMemo(
    () =>
      assets.map((item) => ({
        asset: item.asset,
        symbol: item.token.symbol,
        ...getLedger(item.token.symbol, isStakingLedgerEmpty, stakingDerive),
      })),
    [assets, isStakingLedgerEmpty, stakingDerive]
  );

  return (
    <>
      <Button type={type} onClick={() => setIsVisible(true)} className={className} size={size}>
        {t('Rebond funds')}
      </Button>

      <FormModal<RebondFormValues>
        modalProps={{
          visible: isVisible,
          title: <Label text={t('Rebond funds')} info={t('Rebond the unbonding funds')} />,
        }}
        onCancel={() => setIsVisible(false)}
        extrinsic={(values) => {
          const { fund } = values;
          const value = toWei({ value: fund.amount, unit: getUnit(+fund.token.decimal) });
          const params = isRing(fund.asset) ? [value, new BN(0)] : [new BN(0), value];

          return api.tx.staking.rebond(...params);
        }}
        onSuccess={() => {
          setIsVisible(false);
          updateValidators();
          updateStakingDerive();
        }}
        signer={controllerAccount}
        initialValues={{ stash: stashAccount }}
      >
        <AddressItem
          name="stash"
          label="Stash account"
          disabled
          extra={
            <span className="inline-flex items-center gap-2 text-xs">
              <span>{t('available')}: </span>
              {ledgers.map((item) => (
                <span key={item.asset}>
                  <span>{fromWei({ value: item.unbonding }, prettyNumber)}</span>
                  <span className="uppercase">{item.symbol}</span>
                </span>
              ))}
            </span>
          }
        />

        <FundItem
          label="Amount"
          name="fund"
          extra={null}
          max={ledgers.reduce((acc, cur) => ({ ...acc, [cur.asset]: cur.unbonding }), {})}
        />
      </FormModal>
    </>
  );
}
