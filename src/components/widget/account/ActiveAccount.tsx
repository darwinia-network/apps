import { SettingFilled, QuestionCircleFilled } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useApi } from '../../../hooks';
import { SelectAccountModal } from './SelectAccountModal';

export function ActiveAccount() {
  const {
    connection: { accounts },
    network,
  } = useApi();
  const { t } = useTranslation();
  const { account, setAccount } = useAccount();
  const [isVisible, setIsVisible] = useState(false);

  if (!accounts) {
    return null;
  }

  return (
    <>
      {accounts.length > 1 && (
        <>
          <Button onClick={() => setIsVisible(true)} className="hidden lg:block">
            {t('Switch Account')}
          </Button>

          <SettingFilled
            onClick={() => setIsVisible(true)}
            className={`lg:hidden inline-flex items-center text-2xl h-8 text-${network.name}-main`}
          />
        </>
      )}
      <SelectAccountModal
        visible={isVisible}
        defaultValue={account}
        onCancel={() => setIsVisible(false)}
        onSelect={(acc) => {
          if (acc !== account) {
            setAccount(acc);
          }
          setIsVisible(false);
        }}
        title={
          <div className="inline-flex items-center space-x-1">
            <span>{t('Select active account')}</span>
            <Tooltip
              title={`If your account in the old version cannot be found in your wallet, you can restore JSON which the account in the old version Apps through "Account Migration" and add the JSON to polkadot{.js}.`}
            >
              <QuestionCircleFilled className="cursor-pointer text-gray-400" />
            </Tooltip>
          </div>
        }
        footer={null}
      />
    </>
  );
}
