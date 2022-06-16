import { SettingFilled } from '@ant-design/icons';
import { Button } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi, useWallet, useAccount } from '../../../hooks';
import { SelectAccountModal } from './SelectAccountModal';

export function AccountSelector({ onSuccess = () => undefined }: { onSuccess?: () => void }) {
  const { network } = useApi();
  const { accounts } = useWallet();
  const { account, selectAccount } = useAccount();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <>
      {!account ? (
        <Button onClick={() => setVisible(true)} className="hidden lg:block" type="primary">
          {t('Select Account')}
        </Button>
      ) : accounts.length > 1 ? (
        <>
          <Button onClick={() => setVisible(true)} className="hidden lg:block">
            {t('Switch Account')}
          </Button>

          <SettingFilled
            onClick={() => setVisible(true)}
            className={`lg:hidden inline-flex items-center text-2xl h-8 text-${network.name}-main`}
          />
        </>
      ) : null}
      <SelectAccountModal
        visible={visible}
        defaultValue={account?.address || ''}
        onCancel={() => setVisible(false)}
        onSelect={(acc) => {
          if (acc !== account?.address) {
            selectAccount(acc);
          }
          setVisible(false);
          onSuccess();
        }}
        footer={null}
      />
    </>
  );
}
