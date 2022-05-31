import { TypeRegistry } from '@polkadot/types';
import { Button, Card, notification } from 'antd';
import Form from 'antd/lib/form';
import { useForm } from 'antd/lib/form/Form';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { validateMessages } from '../../config';
import i18n from '../../config/i18n';
import { useAccount, useApi } from '../../hooks';
import { useMetamask } from '../../hooks/ metamask';
import { entrance } from '../../utils';
import { AddressItem } from '../widget/form-control/AddressItem';
import { BalanceControl } from '../widget/form-control/BalanceControl';
import { DVMChainConfig } from '../../model';

interface WithdrawFormValues {
  account: string;
  amount: string;
}

const DVM_WITHDRAW_ADDRESS = '0x0000000000000000000000000000000000000015';
const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000000000000000000000000000';

const registry = new TypeRegistry();

export function Withdraw() {
  const { t } = useTranslation();
  const { network } = useApi();
  const { account } = useAccount();
  const [form] = useForm();
  const {
    connection: { status, accounts },
    connectNetwork,
    disconnect,
  } = useMetamask();
  const [busy, setBusy] = useState(false);

  const activeAccount = useMemo(() => accounts[0]?.address, [accounts]);

  const disableConnect = status !== 'success' && status !== 'pending';

  return (
    <Card>
      <div className="my-8 flex items-center gap-4">
        {activeAccount ? (
          <>
            <span className="text-lg mr-2">{t('Metamask account')}:</span>
            <span>{activeAccount}</span>
          </>
        ) : (
          <span className="text-lg mr-2">{t('Connect to Metamask')}:</span>
        )}

        {status === 'success' && (
          <Button type="default" onClick={() => disconnect()} disabled={disableConnect}>
            {t('Disconnect')}
          </Button>
        )}

        {status === 'pending' && (
          <Button
            type="primary"
            onClick={() => connectNetwork((network as DVMChainConfig).ethereumChain)}
            disabled={disableConnect}
          >
            {t('Connect to Metamask')}
          </Button>
        )}
      </div>

      <Form<WithdrawFormValues>
        form={form}
        initialValues={{
          account,
        }}
        validateMessages={validateMessages[i18n.language as 'en' | 'zh-CN' | 'zh']}
        layout="vertical"
        onFinish={({ account: acc, amount }) => {
          const accountHex = registry.createType('AccountId', acc).toHex();

          if (status === 'success' && accountHex !== EMPTY_ADDRESS) {
            try {
              setBusy(true);
              const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);
              web3.eth
                .sendTransaction({
                  from: accounts[0]?.address,
                  to: DVM_WITHDRAW_ADDRESS,
                  data: accountHex,
                  value: web3.utils.toWei(amount, 'ether'),
                  gas: 55000,
                })
                .on('transactionHash', (hash: string) => {
                  void hash;
                })
                .on('receipt', ({ transactionHash }) => {
                  setBusy(false);
                  notification.success({
                    message: 'Transaction success',
                    description: `Transaction hash: ${transactionHash}`,
                  });
                })
                .catch((error: { code: number; message: string }) => {
                  setBusy(false);
                  console.error(error);
                  notification.error({
                    message: 'Transaction failed',
                    description: error.message,
                  });
                });
            } catch (error) {
              setBusy(false);
              console.error(error);
              notification.error({
                message: 'Transaction failed',
                description: (error as Error).message,
              });
            }
          }
        }}
      >
        <AddressItem label={'Receive account'} name="account" extra={null} />
        <Form.Item label={t('Withdraw amount')} name="amount" rules={[{ required: true }, { min: 0 }]}>
          <BalanceControl size="large" className="w-full" />
        </Form.Item>
        <Form.Item>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            disabled={!activeAccount}
            loading={busy}
            className="w-28"
          >
            {t('Withdraw')}
          </Button>

          <Button
            size="large"
            htmlType="button"
            className="ml-3"
            disabled={!activeAccount}
            onClick={async () => {
              const { kton } = (network as DVMChainConfig).dvm;
              try {
                window.ethereum.request({
                  method: 'wallet_watchAsset',
                  params: {
                    type: 'ERC20',
                    options: {
                      address: kton.address,
                      symbol: kton.symbol,
                      decimals: kton.decimals,
                    },
                  },
                });
              } catch (err) {
                console.error(err);
              }
            }}
          >
            {`Import ${(network as DVMChainConfig).dvm.kton.symbol}`}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
