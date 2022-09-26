import { SubmittableExtrinsic } from '@polkadot/api/types';
import { BN, BN_ZERO, u8aToHex } from '@polkadot/util';
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
  getEvmBalances,
  fromWei,
  toWei,
  convertToEvm,
  handleEthTxResult,
  prettyNumber,
  insufficientBalanceRule,
} from '../../../utils';
import { AddressItem } from '../../widget/form-control/AddressItem';
import { BalanceControl } from '../../widget/form-control/BalanceControl';
import { EVMChainConfig } from '../../../model';
import { ImportToken } from './ImportToken';

interface WithdrawFormValues {
  destination: string;
  asset: string;
  amount: string;
}

const EVM_DISPATCH_ADDRESS = '0x0000000000000000000000000000000000000401';

const capitalLetters = (str: string) => {
  // eslint-disable-next-line no-magic-numbers
  if (str.length < 2) {
    return str;
  }

  return str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase();
};

// eslint-disable-next-line complexity
export function Withdraw() {
  const { t } = useTranslation();
  const { api, network } = useApi();
  const [form] = useForm();
  const {
    busy: metamaskBusy,
    connection: { status, accounts },
    connectNetwork,
    disconnect,
  } = useMetamask();
  const { account, refreshAssets } = useAccount();
  const [visibleAttention, setVisibleAttention] = useState(false);
  const [attentionState, setAttentionState] = useState<CheckboxValueType[]>([]);
  const [busy, setBusy] = useState(false);
  const [evmBalances, setEvmBalances] = useState(['0', '0']); // [ring, kton]

  const { ring, kton } = (network as EVMChainConfig).evm;

  const [withdrawFormValue, setWithdrawFormValue] = useState({
    destination: account?.displayAddress || '',
    asset: ring.symbol,
    amount: '0',
  });

  const activeAccount = useMemo(() => accounts[0]?.address, [accounts]);
  const disableConnect = useMemo(() => status !== 'success' && status !== 'pending', [status]);
  const disableWithdraw = useMemo(
    () => status !== 'success' || !activeAccount || Number(withdrawFormValue.amount) === 0 || busy,
    [status, activeAccount, withdrawFormValue.amount, busy]
  );

  const refreshEvmBalances = useCallback(
    () => from(getEvmBalances(kton?.address || '', activeAccount || '')).subscribe(setEvmBalances),
    [activeAccount, kton?.address]
  );

  // eslint-disable-next-line complexity
  const handleWithdraw = useCallback(() => {
    try {
      setBusy(true);

      const { destination, asset } = withdrawFormValue;
      const amount = toWei({ value: withdrawFormValue.amount, unit: 'ether' });
      const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);

      if (
        asset === ring.symbol ||
        network.name === 'crab' ||
        network.name === 'darwinia' ||
        network.name === 'pangolin' ||
        network.name === 'pangoro'
      ) {
        const transfer = asset === ring.symbol ? api.tx.balances.transfer : api.tx.kton.transfer;
        const extrinsic = transfer(
          destination,
          fromWei({ value: amount }).split('.')[0] // use substrate precision here!! use split to remove possible decimals
        ) as SubmittableExtrinsic<'promise'>;

        from(
          web3.eth.estimateGas({
            from: activeAccount,
            to: EVM_DISPATCH_ADDRESS,
            data: u8aToHex(extrinsic.method.toU8a()),
          })
        ).subscribe((gas) => {
          const maxFeePerGas = new BN(toWei({ value: 10, unit: 'Gwei' }));
          const fee = asset === ring.symbol ? maxFeePerGas.muln(gas) : BN_ZERO;

          const want = new BN(amount);
          const max = asset === ring.symbol ? new BN(evmBalances[0]) : new BN(evmBalances[1]);
          const transferable = want.add(fee).lt(max) ? want : max.sub(fee);

          if (transferable.gt(BN_ZERO)) {
            const extrinsic = transfer(
              destination,
              fromWei({ value: transferable }).split('.')[0] // use substrate precision here!! use split to remove possible decimals
            ) as SubmittableExtrinsic<'promise'>;

            const tx = web3.eth.sendTransaction({
              from: activeAccount,
              to: EVM_DISPATCH_ADDRESS,
              data: u8aToHex(extrinsic.method.toU8a()),
              gas,
            });

            handleEthTxResult(tx, {
              txSuccessCb: () => {
                refreshAssets(); // substrate balance
                refreshEvmBalances();
                setBusy(false);
                setVisibleAttention(false);
              },
              txFailedCb: () => setBusy(false),
            });
          } else {
            notification.warning({
              message: 'Transaction failed',
              description: 'Out of gas',
            });
            setBusy(false);
          }
        });
      } else if (asset === kton?.symbol) {
        const contract = new web3.eth.Contract(abi.ktonABI, kton.address);

        const tx = contract.methods.withdraw(convertToEvm(destination), amount).send({ from: activeAccount });

        handleEthTxResult(tx, {
          txSuccessCb: () => {
            refreshAssets(); // substrate balance
            refreshEvmBalances();
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
  }, [activeAccount, ring, kton, withdrawFormValue, api, evmBalances, network.name, refreshAssets, refreshEvmBalances]);

  useEffect(() => {
    const sub$$ = refreshEvmBalances();

    return () => sub$$.unsubscribe();
  }, [refreshEvmBalances]);

  useEffect(() => {
    const amount = withdrawFormValue.asset === ring.symbol ? new BN(evmBalances[0]) : new BN(evmBalances[1]);

    const amountDisplay = prettyNumber(fromWei({ value: amount.isNeg() ? BN_ZERO : amount, unit: 'ether' }), {
      decimal: Number(network.tokens.ring.decimal),
    });

    form.setFieldsValue({
      amount: amountDisplay,
    });
    setWithdrawFormValue((prev) => ({ ...prev, amount: amountDisplay }));
  }, [withdrawFormValue.asset, evmBalances, ring.symbol, form, network.tokens.ring]);

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
        <div className="my-8 flex items-center space-x-4">
          {activeAccount && (
            <div className="flex" style={{ width: '36rem' }}>
              <div className={`bg-${network.name} flex items-center space-x-1 p-1 my-px pr-10 rounded-l-lg`}>
                <img alt="..." src={`/image/network/${network.name}-dark.svg`} className="w-7 h-7" />
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
              onClick={() => connectNetwork((network as EVMChainConfig).ethereumChain)}
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
              options={[{ label: ring.symbol, value: ring.symbol }].concat(
                kton?.symbol ? [{ label: kton.symbol, value: kton.symbol }] : []
              )}
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
            <BalanceControl size="large" className="w-full" />
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
