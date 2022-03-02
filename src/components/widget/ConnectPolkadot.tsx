import { Button, Modal } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useApi } from '../../hooks';

export function ConnectPolkadot() {
  const { t } = useTranslation();
  const [isHelperModalVisible, setIsHelpModalVisible] = useState(false);
  const { account } = useAccount();
  const { network, connection, connectNetwork } = useApi();

  return (
    <>
      <Button
        onClick={() => {
          if (!connection && !account) {
            setIsHelpModalVisible(true);
          }
          connectNetwork(network);
        }}
        type="primary"
        className="connection"
      >
        {t('Connect Wallet')}
      </Button>

      <Modal
        title={t('Connect to Polkadot')}
        visible={isHelperModalVisible}
        footer={null}
        onCancel={() => setIsHelpModalVisible(false)}
      >
        <div className="flex flex-col items-center">
          <p>{t('You are trying to connect to Polkadot extension, please authorize in the extension.')}</p>

          <div className="flex justify-between items-center p-4 w-full rounded-xl mt-4 border border-gray-200">
            <b>polkadot.js</b>
            <img src="/image/polkadot.svg" style={{ height: 32 }} alt="" />
          </div>

          <Button
            className="mt-4 self-end"
            onClick={() => {
              window.open('https://polkadot.js.org', 'blank');
            }}
          >
            {t('How to use?')}
          </Button>
        </div>
      </Modal>
    </>
  );
}
