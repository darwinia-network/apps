import { SettingFilled } from '@ant-design/icons';
import { u8aConcat, u8aToHex } from '@polkadot/util';
import { Button, Dropdown, Menu } from 'antd';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi, useStaking } from '../../../hooks';
import { useTx } from '../../../hooks/tx';
import { afterTxSuccess } from '../../../providers';
import { signAndSendExtrinsic } from '../../../utils';
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
  const { createObserver } = useTx();
  const { stakingDerive, isValidating, isNominating, controllerAccount, updateStakingDerive, updateValidators } =
    useStaking();

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

  const observer = useMemo(
    () =>
      createObserver({
        next: afterTxSuccess(updateValidators, updateStakingDerive),
      }),
    [createObserver, updateStakingDerive, updateValidators]
  );

  return (
    <div className="flex lg:flex-row flex-col gap-2 items-center">
      {isNominating || isValidating ? (
        <Button
          onClick={() => {
            signAndSendExtrinsic(api, controllerAccount, api.tx.staking.chill()).subscribe(observer);
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
            <SetValidator type="default" className="w-full lg:w-auto" disabled={disabled} />
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
