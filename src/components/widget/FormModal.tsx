import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { Button, Form } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import Modal, { ModalProps } from 'antd/lib/modal';
import { PropsWithChildren, useEffect, useState } from 'react';
import { catchError, from, tap, NEVER } from 'rxjs';
import { useTranslation } from 'react-i18next';
import { validateMessages } from '../../config';
import i18n from '../../config/i18n';
import { useAccount, useQueue } from '../../hooks';
import { TxFailedCallback, TxCallback } from '../../model';

interface ModalFormProps<Values = Record<string, unknown>> {
  extrinsic: (val: Values) => SubmittableExtrinsic<'promise', ISubmittableResult>;
  initialValues?: Partial<Values>;
  defaultValues?: Partial<Values>;
  modalProps: ModalProps;
  onFail?: TxFailedCallback;
  onSuccess?: TxCallback;
  onCancel: () => void;
  signer?: string;
}

export function FormModal<V extends Record<string, unknown>>({
  modalProps,
  children,
  initialValues,
  defaultValues,
  extrinsic,
  signer,
  onSuccess = () => {
    //
  },
  onFail = () => {
    //
  },
  onCancel,
}: PropsWithChildren<ModalFormProps<V>>) {
  const [form] = useForm<V>();
  const { account } = useAccount();
  const { queueExtrinsic } = useQueue();
  const { ...others } = modalProps;
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (defaultValues) {
      form.setFieldsValue(defaultValues as unknown as never);
    }
  }, [defaultValues, form]);

  return (
    <Modal
      {...others}
      destroyOnClose
      maskClosable={false}
      onCancel={onCancel}
      footer={
        <div className="flex flex-col space-y-2">
          <Button
            className="w-full py-1"
            disabled={busy}
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
                    accountId: signer ?? account,
                    extrinsic: extrinsic(value),
                    isUnsigned: false,
                    txSuccessCb: (status) => {
                      setBusy(false);
                      onCancel && onCancel();
                      onSuccess && onSuccess(status);
                    },
                    txFailedCb: (status) => {
                      setBusy(false);
                      onFail && onFail(status);
                    },
                  });
                });
            }}
          >
            {modalProps?.okText || t('OK')}
          </Button>
          <Button onClick={onCancel} className="w-full ml-0 py-1">
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
      >
        {children}
      </Form>
    </Modal>
  );
}
