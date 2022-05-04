import { SettingFilled } from '@ant-design/icons';
import { u8aConcat, u8aToHex } from '@polkadot/util';
import { Button, Dropdown, Menu } from 'antd';
import { useMemo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from } from 'rxjs';
import type { DeriveStakingAccount } from '@polkadot/api-derive/types';
import { useApi, useStaking, useQueue, useSlashingSpans } from '../../../hooks';
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
  const {
    api,
    connection: { accounts },
  } = useApi();
  const { queueExtrinsic } = useQueue();
  const {
    stakingDerive,
    isValidating,
    isNominating,
    controllerAccount,
    stashAccount,
    updateStakingDerive,
    updateValidators,
  } = useStaking();
  const { spanCount } = useSlashingSpans(stashAccount);
  const [stakingAccount, setStakingAccount] = useState<DeriveStakingAccount>();

  useEffect(() => {
    const sub$$ = from(api.derive.staking.account(stashAccount)).subscribe(setStakingAccount);
    return () => sub$$.unsubscribe();
  }, [api, stashAccount]);

  const isOwnController = useMemo(
    () => accounts.map((item) => item.address).includes(controllerAccount),
    [accounts, controllerAccount]
  );

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

  const withdrawFunds = useCallback(() => {
    queueExtrinsic({
      accountId: controllerAccount,
      extrinsic:
        api.tx.staking.withdrawUnbonded?.meta.args.length === 1
          ? api.tx.staking.withdrawUnbonded(spanCount)
          : api.tx.staking.withdrawUnbonded(),
    });
  }, [api, controllerAccount, queueExtrinsic, spanCount]);

  return (
    <div className="flex lg:flex-row flex-col gap-2 items-center">
      {isNominating || isValidating ? (
        <Button
          onClick={() => {
            queueExtrinsic({
              accountId: controllerAccount,
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
            <Menu.Item key="claimRewards">
              <ClaimRewards eraSelectionIndex={eraSelectionIndex} />
            </Menu.Item>

            <Menu.Item key="bondMore">
              <BondMore />
            </Menu.Item>

            <Menu.Item key="unbond">
              <Unbond />
            </Menu.Item>

            <Menu.Item key="deposit">
              <Deposit />
            </Menu.Item>

            <Menu.Item key="rebond">
              <Rebond />
            </Menu.Item>

            <Menu.Item key="withdrawUnbonded">
              <Button
                type="text"
                disabled={
                  !isOwnController || !stakingAccount || !stakingAccount.redeemable || !stakingAccount.redeemable.gtn(0)
                }
                onClick={withdrawFunds}
              >
                {t('Withdraw unbonded funds')}
              </Button>
            </Menu.Item>

            <Menu.Item key="controller">
              <SetController />
            </Menu.Item>

            <Menu.Item key="payee">
              <SetPayee />
            </Menu.Item>

            {isValidating && (
              <Menu.Item key="validator">
                <SetValidator />
              </Menu.Item>
            )}

            {isNominating ? (
              <Menu.Item key="nominees">
                <Nominate label="Set nominees" />
              </Menu.Item>
            ) : (
              <Menu.Item key="session">
                <SetSession label="Set session key" />
              </Menu.Item>
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
