import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { Button, Form } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import Modal, { ModalProps } from 'antd/lib/modal';
import { PropsWithChildren, useEffect, useMemo } from 'react';
import { catchError, from, NEVER, switchMap, tap } from 'rxjs';
import { useTranslation } from 'react-i18next';
import { validateMessages } from '../../config';
import i18n from '../../config/i18n';
import { useAccount, useApi, useQueue } from '../../hooks';
import { useTx } from '../../hooks/tx';
import { Tx } from '../../model';
import { afterTxSuccess } from '../../providers';
import { signAndSendExtrinsic } from '../../utils';

interface ModalFormProps<Values = Record<string, unknown>> {
  beforeStart?: (val: Values) => void;
  extrinsic: (val: Values) => SubmittableExtrinsic<'promise', ISubmittableResult>;
  initialValues?: Partial<Values>;
  defaultValues?: Partial<Values>;
  modalProps: ModalProps;
  onFail?: (err: Record<string, unknown>) => void;
  onSuccess?: (tx: Tx) => void;
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
  beforeStart,
  onCancel,
}: PropsWithChildren<ModalFormProps<V>>) {
  const [form] = useForm<V>();
  const { api } = useApi();
  const { account } = useAccount();
  const { createObserver, tx } = useTx();
  const { queueExtrinsic } = useQueue();
  const { ...others } = modalProps;
  const observer = useMemo(
    () => createObserver({ next: afterTxSuccess(onSuccess), error: onFail }),
    [createObserver, onSuccess, onFail]
  );
  const { t } = useTranslation();

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
            disabled={!!tx}
            {...modalProps.okButtonProps}
            type="primary"
            onClick={() => {
              from(form.validateFields())
                .pipe(catchError(() => NEVER))
                .subscribe((value) => {
                  queueExtrinsic({
                    accountId: signer ?? account,
                    extrinsic: extrinsic(value),
                    isUnsigned: false,
                    txFailedCb: (status) => console.log('tx fail:', status),
                    txStartCb: () => console.log('tx start'),
                    txSuccessCb: (status) => console.log('tx success:', status),
                    txUpdateCb: (status) => console.log('tx update:', status),
                  });
                  queueExtrinsic({
                    accountId: signer ?? account,
                    extrinsic: extrinsic(value),
                    isUnsigned: false,
                    txFailedCb: (status) => console.log('tx fail:', status),
                    txStartCb: () => console.log('tx start'),
                    txSuccessCb: (status) => console.log('tx success:', status),
                    txUpdateCb: (status) => console.log('tx update:', status),
                  });
                  queueExtrinsic({
                    accountId: signer ?? account,
                    extrinsic: extrinsic(value),
                    isUnsigned: false,
                    txFailedCb: (status) => console.log('tx fail:', status),
                    txStartCb: () => console.log('tx start'),
                    txSuccessCb: (status) => console.log('tx success:', status),
                    txUpdateCb: (status) => console.log('tx update:', status),
                  });
                  onCancel && onCancel();
                });

              if (api) {
                return;
              }
              from(form.validateFields())
                .pipe(
                  catchError(() => NEVER),
                  tap((value) => {
                    if (beforeStart) {
                      beforeStart(value);
                    }
                  }),
                  switchMap((value) => {
                    const ext = extrinsic(value);

                    return signAndSendExtrinsic(api, signer ?? account, ext);
                  })
                )
                .subscribe(observer);
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
