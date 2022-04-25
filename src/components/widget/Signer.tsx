import { Modal, Button, Typography } from 'antd';
import { ApiPromise, SubmittableResult } from '@polkadot/api';
import type { DefinitionRpcExt } from '@polkadot/types/types';
import { assert, isFunction, loggerFormat, BN_ZERO } from '@polkadot/util';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { keyring } from '@polkadot/ui-keyring';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { SignerOptions } from '@polkadot/api/submittable/types';
import type { Multisig, Timepoint } from '@polkadot/types/interfaces';
import type { Option } from '@polkadot/types';
import { web3FromSource } from '@polkadot/extension-dapp';
import { handleTxResults, extractExternal } from '../../utils';
import { QueueTx, QueueTxResult, QueueTxMessageSetStatus, AddressProxy } from '../../model';
import { useQueue, useApi } from '../../hooks';

interface ItemState {
  count: number;
  currentItem: QueueTx | null;
  isRpc: boolean;
  isVisible: boolean;
  requestAddress: string | null;
}

const NOOP = () => undefined;

const AVAIL_STATUS = ['queued', 'qr', 'signing'];

async function extractParams(
  _: ApiPromise,
  address: string,
  options: Partial<SignerOptions>
): Promise<['qr' | 'signing', string, Partial<SignerOptions>]> {
  const pair = keyring.getPair(address);
  const {
    meta: { isInjected, source },
  } = pair;

  assert(isInjected, `Unable to find a injected`);

  const injected = await web3FromSource(source as string);
  assert(injected, `Unable to find a signer for ${address}`);

  return ['signing', address, { ...options, signer: injected.signer }];
}

// eslint-disable-next-line complexity
async function wrapTx(
  api: ApiPromise,
  currentItem: QueueTx,
  { isMultiCall, multiRoot, proxyRoot, signAddress }: AddressProxy
): Promise<SubmittableExtrinsic<'promise'>> {
  let tx = currentItem.extrinsic as SubmittableExtrinsic<'promise'>;

  if (proxyRoot) {
    tx = api.tx.proxy.proxy(proxyRoot, null, tx);
  }

  if (multiRoot) {
    const multiModule = api.tx.multisig ? 'multisig' : 'utility';
    const [info, { weight }] = await Promise.all([
      api.query[multiModule].multisigs<Option<Multisig>>(multiRoot, tx.method.hash),
      tx.paymentInfo(multiRoot),
    ]);
    const { threshold, who } = extractExternal(multiRoot);
    const others = who.filter((w) => w !== signAddress);
    let timepoint: Timepoint | null = null;

    if (info.isSome) {
      timepoint = info.unwrap().when;
    }

    tx = isMultiCall
      ? // eslint-disable-next-line no-magic-numbers
        api.tx[multiModule].asMulti.meta.args.length === 6
        ? // We are doing toHex here since we have a Vec<u8> input
          api.tx[multiModule].asMulti(threshold, others, timepoint, tx.method.toHex(), false, weight)
        : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          api.tx[multiModule].asMulti(threshold, others, timepoint, tx.method)
      : // eslint-disable-next-line no-magic-numbers
      api.tx[multiModule].approveAsMulti.meta.args.length === 5
      ? api.tx[multiModule].approveAsMulti(threshold, others, timepoint, tx.method.hash, weight)
      : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        api.tx[multiModule].approveAsMulti(threshold, others, timepoint, tx.method.hash);
  }

  return tx;
}

async function signAndSend(
  queueSetTxStatus: QueueTxMessageSetStatus,
  currentItem: QueueTx,
  tx: SubmittableExtrinsic<'promise'>,
  pairOrAddress: KeyringPair | string,
  options: Partial<SignerOptions>
): Promise<void> {
  if (currentItem.txStartCb) {
    currentItem.txStartCb();
  }

  try {
    await tx.signAsync(pairOrAddress, options);

    console.info('sending', tx.toHex());

    queueSetTxStatus(currentItem.id, 'sending');

    const unsubscribe = await tx.send(
      handleTxResults('signAndSend', queueSetTxStatus, currentItem, (): void => {
        unsubscribe();
      })
    );
  } catch (error) {
    console.error('signAndSend: error:', error);
    queueSetTxStatus(currentItem.id, 'error', undefined, error as Error);

    if (currentItem.txFailedCb) {
      currentItem.txFailedCb(error as Error);
    }
  }
}

async function submitRpc(
  api: ApiPromise,
  { method, section }: DefinitionRpcExt,
  values: unknown[]
): Promise<QueueTxResult> {
  try {
    const rpc = api.rpc as Record<string, Record<string, (...params: unknown[]) => Promise<unknown>>>;

    assert(isFunction(rpc[section] && rpc[section][method]), `api.rpc.${section}.${method} does not exist`);

    const result = await rpc[section][method](...values);

    console.log('submitRpc: result ::', loggerFormat(result));

    return {
      result,
      status: 'sent',
    };
  } catch (error) {
    console.error(error);

    return {
      error: error as Error,
      status: 'error',
    };
  }
}

async function sendRpc(
  api: ApiPromise,
  queueSetTxStatus: QueueTxMessageSetStatus,
  { id, rpc, values = [] }: QueueTx
): Promise<void> {
  if (rpc) {
    queueSetTxStatus(id, 'sending');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { error, result, status } = await submitRpc(api, rpc, values);

    queueSetTxStatus(id, status, result as SubmittableResult, error);
  }
}

// eslint-disable-next-line complexity
function extractCurrent(txqueue: QueueTx[]): ItemState {
  const available = txqueue.filter(({ status }) => AVAIL_STATUS.includes(status));
  const currentItem = available[0] || null;
  let isRpc = false;
  let isVisible = false;

  if (currentItem) {
    if (currentItem.status === 'queued' && !(currentItem.extrinsic || currentItem.payload)) {
      isRpc = true;
    } else if (currentItem.status !== 'signing') {
      isVisible = true;
    }
  }

  return {
    count: available.length,
    currentItem,
    isRpc,
    isVisible,
    requestAddress: (currentItem && currentItem.accountId) || null,
  };
}

export const Signer = () => {
  const { api } = useApi();
  const { txqueue, queueSetTxStatus } = useQueue();
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const { count, currentItem, isRpc, isVisible, requestAddress } = useMemo(() => extractCurrent(txqueue), [txqueue]);
  const senderInfo = useMemo<AddressProxy>(
    () => ({
      isMultiCall: false,
      isUnlockCached: false,
      multiRoot: null,
      proxyRoot: null,
      signAddress: requestAddress,
      signPassword: '',
    }),
    [requestAddress]
  );
  const [section, method] = useMemo(() => {
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
      return [section, method];
    }

    return ['unknown', 'unknown'];
  }, [currentItem]);

  const onCancel = useCallback((): void => {
    if (currentItem) {
      const { id, signerCb = NOOP, txFailedCb = NOOP } = currentItem;

      queueSetTxStatus(id, 'cancelled');
      signerCb(id, null);
      txFailedCb(null);
    }
  }, [currentItem, queueSetTxStatus]);

  const doSendPayload = useCallback(
    (queueSetTxStatus: QueueTxMessageSetStatus, currentItem: QueueTx, senderInfo: AddressProxy): void => {
      if (senderInfo.signAddress && currentItem.payload) {
        const { id, payload, signerCb = NOOP } = currentItem;
        const pair = keyring.getPair(senderInfo.signAddress);
        const result = api.createType('ExtrinsicPayload', payload, { version: payload.version }).sign(pair);

        signerCb(id, { id, ...result });
        queueSetTxStatus(id, 'completed');
      }
    },
    [api]
  );

  const doSend = useCallback(
    async (
      queueSetTxStatus: QueueTxMessageSetStatus,
      currentItem: QueueTx,
      senderInfo: AddressProxy
    ): Promise<void> => {
      if (senderInfo.signAddress) {
        const [tx, [status, pairOrAddress, options]] = await Promise.all([
          wrapTx(api, currentItem, senderInfo),
          extractParams(api, senderInfo.signAddress, { nonce: -1, tip: BN_ZERO }),
        ]);

        queueSetTxStatus(currentItem.id, status);

        await signAndSend(queueSetTxStatus, currentItem, tx, pairOrAddress, options);
      }
    },
    [api]
  );

  const handleClickConfirm = useCallback(() => {
    setBusy(true);

    const errorHandler = (error: Error): void => {
      console.error(error);
      setBusy(false);
    };

    if (currentItem?.payload) {
      doSendPayload(queueSetTxStatus, currentItem, senderInfo);
    } else if (currentItem) {
      doSend(queueSetTxStatus, currentItem, senderInfo).catch(errorHandler);
    }
  }, [currentItem, senderInfo, doSendPayload, doSend, queueSetTxStatus]);

  useEffect((): void => {
    isRpc && currentItem && sendRpc(api, queueSetTxStatus, currentItem).catch(console.error);
  }, [api, isRpc, currentItem, queueSetTxStatus]);

  return (
    <>
      {currentItem && isVisible ? (
        <Modal
          title={
            <>
              {t('Authorize transaction')}
              {count === 1 ? undefined : <>&nbsp;1/{count}</>}
            </>
          }
          visible={isVisible}
          destroyOnClose
          maskClosable={false}
          onCancel={onCancel}
          key={currentItem.id}
          footer={
            <Button disabled={busy} onClick={handleClickConfirm}>
              {t('Confirm')}
            </Button>
          }
        >
          <div>
            <Typography.Paragraph>
              Sign and send <Typography.Text strong code>{`${section}.${method}`}</Typography.Text>
            </Typography.Paragraph>
          </div>
        </Modal>
      ) : null}
    </>
  );
};
