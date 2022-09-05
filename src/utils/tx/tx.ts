import { PromiEvent, TransactionReceipt } from 'web3-core';
import { notification } from 'antd';

export const handleEthTxResult = (
  tx: PromiEvent<TransactionReceipt>,
  { txSuccessCb = () => undefined, txFailedCb = () => undefined }: { txSuccessCb?: () => void; txFailedCb?: () => void }
) => {
  tx.on('transactionHash', (hash: string) => {
    void hash;
  })
    .on('receipt', ({ transactionHash }) => {
      txSuccessCb();
      notification.success({
        message: 'Transaction success',
        description: `Transaction hash: ${transactionHash}`,
      });
    })
    .catch((error: { code: number; message: string }) => {
      txFailedCb();
      console.error(error);
      notification.error({
        message: 'Transaction failed',
        description: error.message,
      });
    });
};
