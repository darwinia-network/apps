import { KeyOutlined } from '@ant-design/icons';
import { TypeRegistry } from '@polkadot/types';
import { Button, Card } from 'antd';
import Form from 'antd/lib/form';
import { useForm } from 'antd/lib/form/Form';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import web3 from 'web3';
import { validateMessages } from '../../config';
import i18n from '../../config/i18n';
import { useAccount, useApi, useIsMountedOperator } from '../../hooks';
import { useMetamask } from '../../hooks/ metamask';
import { useTx } from '../../hooks/tx';
import { getSendTransactionObs } from '../../utils';
import { AddressItem } from '../widget/form-control/AddressItem';
import { BalanceControl } from '../widget/form-control/BalanceControl';

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
  const { txProcessObserver } = useTx();
  const [form] = useForm();
  const {
    connection: { status, accounts },
    connectNetwork,
    disconnect,
  } = useMetamask();
  const { takeWhileIsMounted } = useIsMountedOperator();

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
          <Button type="primary" onClick={() => connectNetwork(network)} disabled={disableConnect}>
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
            getSendTransactionObs({
              from: accounts[0].address,
              to: DVM_WITHDRAW_ADDRESS,
              data: accountHex,
              value: web3.utils.toWei(amount, 'ether'),
              gas: 55000,
            })
              .pipe(takeWhileIsMounted())
              .subscribe(txProcessObserver);
          }
        }}
      >
        <AddressItem label={'Receive account'} name="account" extra={null} />

        <Form.Item label={t('Withdraw amount')} name="amount" rules={[{ required: true }, { min: 0 }]}>
          <BalanceControl size="large" className="w-full" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" disabled={!activeAccount} className="flex items-center">
            <KeyOutlined />
            <span>{t('Withdraw')}</span>
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
