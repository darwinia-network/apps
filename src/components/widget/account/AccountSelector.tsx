import { SettingFilled, QuestionCircleFilled } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi, useWallet } from '../../../hooks';
import { SelectAccountModal } from './SelectAccountModal';

export function AccountSelector() {
  const { network } = useApi();
  const { account, accounts, selectAccount } = useWallet();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <>
      {accounts.length > 1 && (
        <>
          <Button onClick={() => setVisible(true)} className="hidden lg:block">
            {t('Switch Account')}
          </Button>

          <SettingFilled
            onClick={() => setVisible(true)}
            className={`lg:hidden inline-flex items-center text-2xl h-8 text-${network.name}-main`}
          />
        </>
      )}
      <SelectAccountModal
        visible={visible}
        defaultValue={account?.address || ''}
        onCancel={() => setVisible(false)}
        onSelect={(acc) => {
          if (acc !== account?.address) {
            selectAccount(acc);
          }
          setVisible(false);
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
