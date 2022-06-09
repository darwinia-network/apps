import { TypeRegistry } from '@polkadot/types';
import { BN, BN_ZERO } from '@polkadot/util';
import { Button, Card, Select, Modal, Checkbox, notification } from 'antd';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';
import Form from 'antd/lib/form';
import { useForm } from 'antd/lib/form/Form';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from } from 'rxjs';
import { validateMessages } from '../../../config';
import { abi } from '../../../config/abi';
import i18n from '../../../config/i18n';
import { useAccount, useApi } from '../../../hooks';
import { useMetamask } from '../../../hooks/ metamask';
import {
  entrance,
  getDvmBalances,
  fromWei,
  toWei,
  convertToDvm,
  handleEthTxResult,
  insufficientBalanceRule,
} from '../../../utils';
import { AddressItem } from '../../widget/form-control/AddressItem';
import { BalanceControl } from '../../widget/form-control/BalanceControl';
import { DVMChainConfig } from '../../../model';
import { ClaimKton } from './ClaimKton';
import { ImportToken } from './ImportToken';

interface WithdrawFormValues {
  destination: string;
  asset: string;
  amount: string;
}

const WITHDRAW_GAS = 55000;
const DVM_WITHDRAW_ADDRESS = '0x0000000000000000000000000000000000000015';
const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000000000000000000000000000';

const registry = new TypeRegistry();

const capitalLetters = (str: string) => {
  // eslint-disable-next-line no-magic-numbers
  if (str.length < 2) {
    return str;
  }

  return str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase();
};

export function Withdraw() {
  const { t } = useTranslation();
  const { network } = useApi();
  const [form] = useForm();
  const {
    busy: metamaskBusy,
    connection: { status, accounts },
    connectNetwork,
    disconnect,
  } = useMetamask();
  const { account, getBalances } = useAccount();
  const [visibleAttention, setVisibleAttention] = useState(false);
  const [attentionState, setAttentionState] = useState<CheckboxValueType[]>([]);
  const [busy, setBusy] = useState(false);
  const [dvmBalances, setDvmBalances] = useState(['0', '0']); // [ring, kton]

  const { ring, kton } = (network as DVMChainConfig).dvm;

  const [withdrawFormValue, setWithdrawFormValue] = useState({
    destination: account,
    asset: ring.symbol,
    amount: '0',
  });

  const activeAccount = useMemo(() => accounts[0]?.address, [accounts]);
  const disableConnect = useMemo(() => status !== 'success' && status !== 'pending', [status]);
  const disableWithdraw = useMemo(
    () => status !== 'success' || !activeAccount || Number(withdrawFormValue.amount) === 0 || busy,
    [status, activeAccount, withdrawFormValue.amount, busy]
  );

  const refreshDvmBalances = useCallback(
    () => from(getDvmBalances(kton.address, activeAccount || '')).subscribe(setDvmBalances),
    [activeAccount, kton.address]
  );

  const handleWithdraw = useCallback(() => {
    try {
      setBusy(true);

      const { destination, asset, amount } = withdrawFormValue;
      const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);

      if (asset === ring.symbol) {
        const accountHex = registry.createType('AccountId', destination).toHex();

        if (accountHex !== EMPTY_ADDRESS) {
          const tx = web3.eth.sendTransaction({
            from: activeAccount,
            to: DVM_WITHDRAW_ADDRESS,
            data: accountHex,
            value: web3.utils.toWei(amount, 'ether'),
            gas: WITHDRAW_GAS,
          });

          handleEthTxResult(tx, {
            txSuccessCb: () => {
              getBalances(); // substrate balance
              refreshDvmBalances();
              setBusy(false);
              setVisibleAttention(false);
            },
            txFailedCb: () => setBusy(false),
          });
        }
      } else if (asset === kton.symbol) {
        const contract = new web3.eth.Contract(abi.ktonABI, kton.address);

        const tx = contract.methods
          .withdraw(convertToDvm(destination), toWei({ value: amount, unit: 'ether' }))
          .send({ from: activeAccount });

        handleEthTxResult(tx, {
          txSuccessCb: () => {
            getBalances(); // substrate balance
            refreshDvmBalances();
            setBusy(false);
            setVisibleAttention(false);
          },
          txFailedCb: () => setBusy(false),
        });
      }
    } catch (error) {
      setBusy(false);
      console.error(error);
      notification.error({
        message: 'Transaction failed',
        description: (error as Error).message,
      });
    }
  }, [activeAccount, ring, kton, withdrawFormValue, getBalances, refreshDvmBalances]);

  useEffect(() => {
    const sub$$ = refreshDvmBalances();

    return () => sub$$.unsubscribe();
  }, [refreshDvmBalances]);

  useEffect(() => {
    const amount =
      withdrawFormValue.asset === ring.symbol
        ? new BN(dvmBalances[0]).sub(new BN(WITHDRAW_GAS))
        : new BN(dvmBalances[1]);

    const [integer, decimal = '0'] = fromWei({ value: amount.isNeg() ? BN_ZERO : amount, unit: 'ether' }).split('.');
    // eslint-disable-next-line no-magic-numbers
    const amountDisplay = [integer, decimal.substring(0, 3)].join('.');

    form.setFieldsValue({
      amount: amountDisplay,
    });
    setWithdrawFormValue((prev) => ({ ...prev, amount: amountDisplay }));
  }, [withdrawFormValue.asset, dvmBalances, ring.symbol, form]);

  const attentionsOpts = useMemo(
    () => [
      {
        label: `I am trying to transfer from 「${capitalLetters(network.name)} Smart Address 」to 「${capitalLetters(
          network.name
        )} Substrate Address」.`,
        value: 0,
      },
      {
        label: `I have confirmed that the「${capitalLetters(network.name)} Substrate Address」: ${
          withdrawFormValue.destination
        } is safe and available.`,
        value: 1,
      },
      {
        label: 'I have confirmed that the address above is not an exchange address or cloud wallet address.',
        value: 2,
      },
    ],
    [network.name, withdrawFormValue.destination]
  );

  return (
    <>
      <Card>
        <ClaimKton dvmAddress={activeAccount} onSuccess={refreshDvmBalances} />

        <div className="my-8 flex items-center space-x-4">
          {activeAccount && (
            <div className="flex" style={{ width: '36rem' }}>
              <div className={`bg-${network.name} flex items-center space-x-1 p-1 my-px pr-10 rounded-l-lg`}>
                <img alt="..." src={`/image/${network.name}-1.svg`} className="w-7 h-7" />
                <div className="text-white capitalize">{network.name}</div>
                <div className="text-white">Smart</div>
              </div>
              <input
                className="border border-gray-300 rounded-lg px-2 -ml-2 w-full bg-white text-base"
                value={activeAccount}
                disabled
              />
            </div>
          )}

          {status === 'success' && (
            <div className='="flex items-center space-x-2'>
              <Button type="default" onClick={() => disconnect()} disabled={disableConnect} size="large">
                {t('Disconnect')}
              </Button>

              <ImportToken disabled={!activeAccount} token={kton} />
            </div>
          )}

          {status === 'pending' && (
            <Button
              type="primary"
              size="large"
              onClick={() => connectNetwork((network as DVMChainConfig).ethereumChain)}
              disabled={disableConnect}
              loading={metamaskBusy}
            >
              {t('Connect to Metamask')}
            </Button>
          )}
        </div>

        <Form<WithdrawFormValues>
          form={form}
          initialValues={withdrawFormValue}
          className="max-w-xl"
          validateMessages={validateMessages[i18n.language as 'en' | 'zh-CN' | 'zh']}
          layout="vertical"
          onValuesChange={({ asset }) => {
            if (asset) {
              setWithdrawFormValue((prev) => ({ ...prev, asset }));
            }
          }}
          onFinish={({ destination, asset, amount }) => {
            setVisibleAttention(true);
            setWithdrawFormValue({ destination, asset, amount });
          }}
        >
          <AddressItem label={'Destination address'} name="destination" extra={null} />
          <Form.Item label={t('Asset')} name="asset" rules={[{ required: true }]}>
            <Select
              size="large"
              options={[
                { label: ring.symbol, value: ring.symbol },
                { label: kton.symbol, value: kton.symbol },
              ]}
            />
          </Form.Item>
          <Form.Item
            label={t('Withdraw amount')}
            name="amount"
            rules={[
              { required: true },
              { min: 0 },
              insufficientBalanceRule({
                t,
                compared: toWei({ value: withdrawFormValue.amount, unit: 'ether' }),
                token: { symbol: ring.symbol, decimal: ring.decimals.toString() },
              }),
            ]}
          >
            <BalanceControl size="large" className="w-full" precision={3} />
          </Form.Item>
          <Form.Item>
            <Button size="large" type="primary" htmlType="submit" disabled={disableWithdraw} className="w-28">
              {t('Withdraw')}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        visible={visibleAttention}
        title="Attention"
        onCancel={() => setVisibleAttention(false)}
        footer={
          <div className="flex items-center justify-center space-x-4">
            <Button className="w-5/12" size="large" onClick={() => setVisibleAttention(false)} disabled={busy}>
              Cancel
            </Button>
            <Button
              className="w-5/12"
              size="large"
              type="primary"
              loading={busy}
              disabled={attentionState.length !== attentionsOpts.length}
              onClick={handleWithdraw}
            >
              Confirm
            </Button>
          </div>
        }
      >
        <Checkbox.Group options={attentionsOpts} defaultValue={attentionState} onChange={setAttentionState} />
      </Modal>
    </>
  );
}
