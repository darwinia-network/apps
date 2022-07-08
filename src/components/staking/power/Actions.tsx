import { SettingFilled } from '@ant-design/icons';
import { u8aConcat, u8aToHex } from '@polkadot/util';
import { Button, Dropdown, Menu } from 'antd';
import { useMemo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from, EMPTY } from 'rxjs';
import type { DeriveStakingAccount } from '../../../api-derive/types';
import { useApi, useStaking, useQueue, useSlashingSpans, useAccount, useWallet } from '../../../hooks';
import {
  BondMore,
  ClaimRewards,
  Deposit,
  Nominate,
  Rebond,
  SetController,
  SetPayee,
  SetSession,
  SetValidator,
  Unbond,
} from '../action';

interface ActionsProps {
  disabled?: boolean;
  eraSelectionIndex: number;
}

// eslint-disable-next-line complexity
export function Actions({ eraSelectionIndex, disabled }: ActionsProps) {
  const { t } = useTranslation();
  const { api } = useApi();
  const { accounts } = useWallet();
  const { refreshAssets } = useAccount();
  const { queueExtrinsic } = useQueue();
  const {
    stakingDerive,
    isValidating,
    isNominating,
    stashAccount,
    controllerAccount,
    updateStakingDerive,
    updateValidators,
  } = useStaking();
  const { spanCount } = useSlashingSpans(stashAccount);
  const [stakingAccount, setStakingAccount] = useState<DeriveStakingAccount>();

  const sessionAccounts = useMemo(() => {
    if (!stakingDerive) {
      return [];
    }

    const { sessionIds, nextSessionIds } = stakingDerive;

    return nextSessionIds.length ? nextSessionIds : sessionIds;
  }, [stakingDerive]);

  const nextSessionAccount = useMemo(() => {
    if (!stakingDerive) {
      return '';
    }

    const { nextSessionIds } = stakingDerive;
    const nextConcat = u8aConcat(...nextSessionIds.map((id) => id.toU8a()));
    const len = 48;

    return u8aToHex(nextConcat, len);
  }, [stakingDerive]);

  const isOwnController = useMemo(
    () => !!controllerAccount && accounts.map((item) => item.displayAddress).includes(controllerAccount),
    [accounts, controllerAccount]
  );

  const refreshStakingAccount = useCallback(() => {
    if (stashAccount) {
      return from(api.derive.staking.account(stashAccount) as unknown as Promise<DeriveStakingAccount>).subscribe(
        setStakingAccount
      );
    } else {
      return EMPTY.subscribe();
    }
  }, [api, stashAccount]);

  const withdrawFunds = useCallback(() => {
    queueExtrinsic({
      signAddress: controllerAccount,
      extrinsic:
        api.tx.staking.withdrawUnbonded?.meta.args.length === 1
          ? api.tx.staking.withdrawUnbonded(spanCount)
          : api.tx.staking.withdrawUnbonded(),
      txSuccessCb: () => {
        refreshAssets();
        updateStakingDerive();
        refreshStakingAccount();
      },
    });
  }, [api, controllerAccount, queueExtrinsic, refreshStakingAccount, refreshAssets, updateStakingDerive, spanCount]);

  useEffect(() => {
    const sub$$ = refreshStakingAccount();
    return () => sub$$.unsubscribe();
  }, [refreshStakingAccount]);

  return (
    <div className="flex lg:flex-row flex-col gap-2 items-center">
      {isNominating || isValidating ? (
        <Button
          onClick={() => {
            queueExtrinsic({
              signAddress: controllerAccount,
              extrinsic: api.tx.staking.chill(),
              txSuccessCb: () => {
                updateValidators();
                updateStakingDerive();
              },
            });
          }}
          className="w-full lg:w-auto"
          disabled={disabled}
        >
          {t(isNominating ? 'Stop Nominating' : 'Stop Validating')}
        </Button>
      ) : (
        <>
          {!sessionAccounts.length || nextSessionAccount === '0x' ? (
            <SetSession type="default" className="w-full lg:w-auto" disabled={disabled} />
          ) : (
            <SetValidator type="default" className="w-full lg:w-auto" disabled={disabled} label="Validator" />
          )}
          <Nominate type="default" className="w-full lg:w-auto" disabled={disabled} />
        </>
      )}
      <Dropdown
        disabled={disabled}
        overlay={
          <Menu>
            {[
              <ClaimRewards
                className="w-full text-left"
                size="large"
                eraSelectionIndex={eraSelectionIndex}
                key="claim rewards"
              />,
              <BondMore className="w-full text-left" size="large" key="bond more" />,
              <Unbond className="w-full text-left" size="large" key="unbond" />,
              <Deposit className="w-full text-left" size="large" key="deposit" />,
              <Rebond className="w-full text-left" size="large" key="rebond" />,
              <Button
                type="text"
                disabled={!isOwnController || !stakingAccount?.redeemable?.gtn(0)}
                onClick={withdrawFunds}
                className="w-full text-left"
                size="large"
                key="withdraw unbonded"
              >
                {t('Withdraw unbonded funds')}
              </Button>,
              <SetController className="w-full text-left" size="large" key="set controller" />,
              <SetPayee className="w-full text-left" size="large" key="set payee" />,
              isValidating ? <SetValidator className="w-full text-left" size="large" key="set validator" /> : null,
              isNominating ? (
                <Nominate className="w-full text-left" size="large" label="Set nominees" key="nominate" />
              ) : (
                <SetSession className="w-full text-left" size="large" label="Set session key" key="set session" />
              ),
            ].map((component, index) =>
              component ? (
                <Menu.Item key={index} className="p-0 my-1">
                  {component}
                </Menu.Item>
              ) : null
            )}
          </Menu>
        }
        className={`lg:static absolute right-6 top-6 ${disabled ? `cursor-not-allowed` : 'cursor-pointer'}`}
      >
        <SettingFilled className="text-lg text-gray-400" />
      </Dropdown>
    </div>
  );
}
