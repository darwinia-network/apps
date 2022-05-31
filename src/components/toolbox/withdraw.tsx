import { TypeRegistry } from '@polkadot/types';
import { Button, Card, Select, notification } from 'antd';
import Form from 'antd/lib/form';
import { useForm } from 'antd/lib/form/Form';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from } from 'rxjs';
import { PromiEvent, TransactionReceipt } from 'web3-core';
import { validateMessages } from '../../config';
import { abi } from '../../config/abi';
import i18n from '../../config/i18n';
import { useAccount, useApi } from '../../hooks';
import { useMetamask } from '../../hooks/ metamask';
import { entrance, getDvmBalance, fromWei, toWei, convertToDvm } from '../../utils';
import { AddressItem } from '../widget/form-control/AddressItem';
import { BalanceControl } from '../widget/form-control/BalanceControl';
import { DVMChainConfig } from '../../model';

interface WithdrawFormValues {
  destination: string;
  asset: string;
  amount: string;
}

const DVM_WITHDRAW_ADDRESS = '0x0000000000000000000000000000000000000015';
const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000000000000000000000000000';

const registry = new TypeRegistry();

export function Withdraw() {
  const { t } = useTranslation();
  const { network } = useApi();
  const [form] = useForm();
  const {
    connection: { status, accounts },
    connectNetwork,
    disconnect,
  } = useMetamask();
  const [busy, setBusy] = useState(false);
  const [balances, setBalances] = useState(['0', '0']);

  const { ring, kton } = (network as DVMChainConfig).dvm;

  const { account } = useAccount();
  const [asset, setAsset] = useState(ring.symbol);

  const activeAccount = useMemo(() => accounts[0]?.address, [accounts]);

  const disableConnect = useMemo(() => status !== 'success' && status !== 'pending', [status]);

  const handleTxResult = (
    tx: PromiEvent<TransactionReceipt>,
    { txSuccessCb = () => undefined, txFailedCb = () => undefined }: { txSuccessCb: () => void; txFailedCb: () => void }
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

  const handleWithdraw = useCallback(
    (destination: string, asset: string, amount: string) => {
      try {
        setBusy(true);

        const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);

        if (asset === ring.symbol) {
          const accountHex = registry.createType('AccountId', destination).toHex();

          if (accountHex !== EMPTY_ADDRESS) {
            const tx = web3.eth.sendTransaction({
              from: activeAccount,
              to: DVM_WITHDRAW_ADDRESS,
              data: accountHex,
              value: web3.utils.toWei(amount, 'ether'),
              gas: 55000,
            });

            handleTxResult(tx, {
              txSuccessCb: () => setBusy(false),
              txFailedCb: () => setBusy(false),
            });
          }
        } else if (asset === kton.symbol) {
          const contract = new web3.eth.Contract(abi.ktonABI, kton.address);

          const tx = contract.methods
            .withdraw(convertToDvm(destination), toWei({ value: amount, unit: 'ether' }))
            .send({ from: activeAccount });

          handleTxResult(tx, {
            txSuccessCb: () => setBusy(false),
            txFailedCb: () => setBusy(false),
          });
        }
      } catch (err) {
        setBusy(false);
        console.error(err);
        notification.error({
          message: 'Transaction failed',
          description: (err as Error).message,
        });
      }
    },
    [activeAccount, ring, kton]
  );

  useEffect(() => {
    const amount = asset === ring.symbol ? balances[0] : balances[1];
    form.setFieldsValue({ amount: fromWei({ value: amount, unit: 'ether' }) });
  }, [asset, balances, ring.symbol, form]);

  useEffect(() => {
    const sub$$ = from(getDvmBalance(kton.address, activeAccount || '')).subscribe(setBalances);

    return () => sub$$.unsubscribe();
  }, [activeAccount, kton.address]);

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
          destination: account,
          asset,
          amount: '0',
        }}
        className="max-w-xl"
        validateMessages={validateMessages[i18n.language as 'en' | 'zh-CN' | 'zh']}
        layout="vertical"
        onValuesChange={({ asset }) => {
          if (asset) {
            setAsset(asset);
          }
        }}
        onFinish={({ destination, asset, amount }) => {
          handleWithdraw(destination, asset, amount);
        }}
      >
        <AddressItem label={'Destination address'} name="destination" extra={null} />
        <Form.Item label={'Asset'} name="asset" rules={[{ required: true }]}>
          <Select
            size="large"
            options={[
              { label: ring.symbol, value: ring.symbol },
              { label: kton.symbol, value: kton.symbol },
            ]}
          />
        </Form.Item>
        <Form.Item label={t('Withdraw amount')} name="amount" rules={[{ required: true }, { min: 0 }]}>
          <BalanceControl size="large" className="w-full" />
        </Form.Item>
        <Form.Item>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            disabled={status !== 'success' || !activeAccount}
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
            {`Import ${kton.symbol}`}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
