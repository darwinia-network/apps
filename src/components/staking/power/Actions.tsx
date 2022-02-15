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
  SetIdentity,
  SetPayee,
  SetSession,
  SetValidator,
  Unbond,
} from '../action';

interface ActionsProps {
  eraSelectionIndex: number;
}

// eslint-disable-next-line complexity
export function Actions({ eraSelectionIndex }: ActionsProps) {
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
    <div className="flex gap-2 items-center">
      {isNominating || isValidating ? (
        <Button
          onClick={() => {
            signAndSendExtrinsic(api, controllerAccount, api.tx.staking.chill()).subscribe(observer);
          }}
        >
          {t(isNominating ? 'Stop Nominating' : 'Stop Validating')}
        </Button>
      ) : (
        <>
          {!sessionAccounts.length || nextSessionAccount === '0x' ? (
            <SetSession type="default" />
          ) : (
            <SetValidator type="default" />
          )}
          <Nominate type="default" />
        </>
      )}
      <Dropdown
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

            <Menu.Item key="identity">
              <SetIdentity />
            </Menu.Item>
          </Menu>
        }
      >
        <SettingFilled className="text-lg text-gray-400 cursor-pointer" />
      </Dropdown>
    </div>
  );
}
