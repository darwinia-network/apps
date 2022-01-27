import { SettingFilled } from '@ant-design/icons';
import { u8aConcat, u8aToHex } from '@polkadot/util';
import { Button, Dropdown, Menu } from 'antd';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi, useStaking } from '../../../hooks';
import { useTx } from '../../../hooks/tx';
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
  const { observer } = useTx();
  const { stakingDerive, validators, isValidating, isNominating, controllerAccount } = useStaking();

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

  console.log(
    '%c [ stakingDerive ]-9',
    'font-size:13px; background:pink; color:#bf2c9f;',
    isNominating,
    isValidating,
    stakingDerive,
    validators?.toArray()
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
            <Menu.Item>
              <ClaimRewards eraSelectionIndex={eraSelectionIndex} />
            </Menu.Item>

            <Menu.Item>
              <BondMore />
            </Menu.Item>

            <Menu.Item>
              <Unbond />
            </Menu.Item>

            <Menu.Item>
              <Deposit />
            </Menu.Item>

            <Menu.Item>
              <Rebond />
            </Menu.Item>

            <Menu.Item>
              <SetController />
            </Menu.Item>

            <Menu.Item>
              <SetPayee />
            </Menu.Item>

            {isValidating && (
              <Menu.Item>
                <SetValidator />
              </Menu.Item>
            )}

            {isNominating ? (
              <Menu.Item>
                <Nominate label="Set nominees" />
              </Menu.Item>
            ) : (
              <Menu.Item>
                <SetSession label="Change session keys" />
              </Menu.Item>
            )}

            <Menu.Item>
              <SetIdentity />
            </Menu.Item>
          </Menu>
        }
      >
        <SettingFilled className="text-lg text-gray-600 cursor-pointer" />
      </Dropdown>
    </div>
  );
}
