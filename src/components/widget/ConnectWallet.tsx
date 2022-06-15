import { Button, Modal, Radio, Spin, notification } from 'antd';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';
import { DownloadOutlined } from '@ant-design/icons';
import type { RadioChangeEvent } from 'antd/lib/radio';
import type { WalletSource } from '../../model';
import { useWallet, useApi } from '../../hooks';

// antd Radio wrap in Radio.Button is hidden
const MyRadio = ({ checked }: { checked?: boolean }) => {
  const { network } = useApi();

  return (
    <span className={`w-5 h-5 rounded-full border relative border-${network.name}-main`}>
      {checked && (
        <span
          className={`absolute top-0 bottom-0 left-0 right-0 m-auto w-3 h-3 rounded-full bg-${
            network.name === 'darwinia' ? network.name + '-main' : network.name
          }`}
        />
      )}
    </span>
  );
};

export const ConnectWallet = () => {
  const { network } = useApi();
  const { supportedWallets, walletToUse, error: walletError, connectWallet, disConnectWallet } = useWallet();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<WalletSource | undefined>(walletToUse?.extensionName);

  const handleSelect = useCallback(
    async (event: RadioChangeEvent) => {
      setBusy(true);
      setSelected(event.target.value);
      disConnectWallet();

      if (await connectWallet(event.target.value)) {
        setVisible(false);
      }

      setBusy(false);
    },
    [connectWallet, disConnectWallet]
  );

  useEffect(() => {
    if (walletError) {
      notification.warning({
        message: 'Failed to select wallet',
        description: walletError.message,
      });
    }
  }, [walletError]);

  return (
    <>
      <Button type={walletToUse ? 'default' : 'primary'} className="connection" onClick={() => setVisible(true)}>
        {walletToUse ? t('Switch Wallet') : t('Connect Wallet')}
      </Button>

      <Modal
        title={walletToUse ? t('Switch Wallet') : t('Connect Wallet')}
        visible={visible}
        footer={null}
        onCancel={() => setVisible(false)}
      >
        <Spin spinning={busy}>
          <Radio.Group className="w-full" defaultValue={selected} onChange={handleSelect}>
            {supportedWallets.map((item) => (
              <Radio.Button
                key={item.extensionName}
                value={item.extensionName}
                disabled={!item.getProvider()}
                className={`radio-list network-radio-button-${network.name}`}
              >
                <div className="flex items-center justify-between w-full pr-3">
                  <div className="flex items-center space-x-2">
                    <img alt={item.logo.alt} src={item.logo.src} className="w-11 h-11" />
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                  {item.getProvider() ? (
                    <MyRadio checked={selected === item.extensionName} />
                  ) : (
                    <DownloadOutlined
                      className={`text-xl text-${network.name}-main`}
                      onClick={() => window.open(item.getInstallUrl(), '_blank', 'noopener noreferrer')}
                    />
                  )}
                </div>
              </Radio.Button>
            ))}
          </Radio.Group>
        </Spin>
      </Modal>
    </>
  );
};
