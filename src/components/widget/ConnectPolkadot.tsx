import { Button, Modal } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useApi } from '../../hooks';

export function ConnectPolkadot() {
  const { t } = useTranslation();
  const [isHelperModalVisible, setIsHelpModalVisible] = useState(true);
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
        closable={false}
        title={t('Connect to Polkadot')}
        visible={isHelperModalVisible}
        footer={null}
        onCancel={() => setIsHelpModalVisible(false)}
      >
        <div className="flex flex-col items-center">
          <p>
            {t(
              'Make sure you you have installed the polkadot extension first, then create an account in it and authorize'
            )}
          </p>

          <div className="flex items-center p-4 w-full rounded-xl mt-4 border border-gray-200 justify-between">
            <div className="flex items-center">
              <img src="/image/polkadot.svg" style={{ height: 44 }} alt="" />
              <b className="ml-3 font-medium text-sm text-black opacity-80">{`polkadot{.js} extension`}</b>
            </div>

            <Button
              type="link"
              onClick={() => {
                window.open('https://polkadot.js.org', 'blank');
              }}
            >
              {t('How to use?')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
