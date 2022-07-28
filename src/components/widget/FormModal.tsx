import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { Button, Form } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import Modal, { ModalProps } from 'antd/lib/modal';
import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { catchError, from, tap, NEVER } from 'rxjs';
import { useTranslation } from 'react-i18next';
import { validateMessages } from '../../config';
import i18n from '../../config/i18n';
import { useAccount, useQueue } from '../../hooks';
import { TxFailedCallback, TxCallback, WithNull } from '../../model';

interface ModalFormProps<Values extends Record<string, unknown>> {
  extrinsic: (val: Values) => SubmittableExtrinsic<'promise', ISubmittableResult>;
  initialValues?: WithNull<Partial<Values>>;
  modalProps: ModalProps;
  signer?: string | null;
  onFail?: TxFailedCallback;
  onSuccess?: TxCallback;
  onCancel: () => void;
  onValuesChange?: (changedValues?: Partial<Values>, allValues?: Values) => void;
}

export function FormModal<V extends Record<string, unknown>>({
  modalProps,
  children,
  initialValues,
  extrinsic,
  signer,
  onSuccess = () => {
    //
  },
  onFail = () => {
    //
  },
  onCancel,
  onValuesChange,
}: PropsWithChildren<ModalFormProps<V>>) {
  const [form] = useForm<V>();
  const { account } = useAccount();
  const { queueExtrinsic } = useQueue();
  const { visible, ...others } = modalProps;
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  const signAddress = useMemo(() => signer ?? account?.displayAddress, [signer, account]);

  useEffect(() => {
    if (visible) {
      // Reset to 「initialValues」 every time we open the modal
      form.resetFields();
    }
  }, [form, visible]);

  return (
    <Modal
      {...others}
      visible={visible}
      forceRender
      destroyOnClose
      maskClosable={false}
      onCancel={onCancel}
      footer={
        <div className="flex flex-col space-y-2">
          <span className="ml-1 text-left text-xs">
            {t('estimated fees of {{amount}} {{token}}', { amount: '0.7021', token: 'RING' })}
          </span>
          <Button
            className="w-full py-1"
            loading={busy}
            size="large"
            {...modalProps.okButtonProps}
            type="primary"
            onClick={() => {
              from(form.validateFields())
                .pipe(
                  catchError(() => NEVER),
                  tap(() => {
                    setBusy(true);
                  })
                )
                .subscribe((value) => {
                  queueExtrinsic({
                    signAddress,
                    extrinsic: extrinsic(value),
                    txSuccessCb: (status) => {
                      setBusy(false);
                      onCancel();
                      onSuccess(status);
                    },
                    txFailedCb: (status) => {
                      setBusy(false);
                      onFail(status);
                    },
                  });
                });
            }}
          >
            {modalProps?.okText || t('OK')}
          </Button>
          <Button onClick={onCancel} className="w-full ml-0 py-1" size="large" disabled={busy}>
            {modalProps?.cancelText || t('Cancel')}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        initialValues={initialValues ?? {}}
        layout="vertical"
        validateMessages={validateMessages[i18n.language as 'en' | 'zh-CN' | 'zh']}
        preserve={false}
        onValuesChange={onValuesChange}
      >
        {children}
      </Form>
    </Modal>
  );
}
