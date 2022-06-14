import { notification } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { signAndSendTx, sendRpc, extractCurrent } from '../../utils';
import { useQueue, useApi, useNetworkColor, useWallet } from '../../hooks';

export const Signer = () => {
  const { color } = useNetworkColor();
  const { api, network } = useApi();
  const { signer } = useWallet();
  const { t } = useTranslation();
  const { txqueue, queueSetTxStatus } = useQueue();
  const { count, currentItem, isRpc, isExtrinsic } = useMemo(() => extractCurrent(txqueue), [txqueue]);

  useEffect((): void => {
    if (currentItem && isRpc) {
      sendRpc(api, currentItem, queueSetTxStatus);
    }
  }, [api, isRpc, currentItem, queueSetTxStatus]);

  useEffect(() => {
    if (currentItem && isExtrinsic && signer) {
      signAndSendTx(currentItem, queueSetTxStatus, signer);
    }
  }, [currentItem, isExtrinsic, signer, queueSetTxStatus]);

  useEffect(() => {
    const key = 'Authorize transaction';

    if (currentItem) {
      const { extrinsic, rpc } = currentItem;
      let { section, method } = rpc;
      if (extrinsic) {
        const found = extrinsic.registry.findMetaCall(extrinsic.callIndex);
        if (found.section !== 'unknown') {
          method = found.method;
          section = found.section;
        }
      }

      notification.open({
        icon: <ClockCircleOutlined className={color} />,
        message: `${t('Authorize transaction')} (1/${count})`,
        description: `${t('Current')}: ${section}.${method}`,
        key,
        duration: null,
      });
    } else {
      notification.close(key);
    }
  }, [t, color, count, currentItem, network]);

  return null;
};
