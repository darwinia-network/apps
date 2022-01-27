import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { Form } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import Modal, { ModalProps } from 'antd/lib/modal';
import { PropsWithChildren } from 'react';
import { catchError, from, NEVER, switchMap, tap } from 'rxjs';
import { validateMessages } from '../../config';
import i18n from '../../config/i18n';
import { useAccount, useApi } from '../../hooks';
import { useTx } from '../../hooks/tx';
import { Tx } from '../../model';
import { signAndSendExtrinsic } from '../../utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ModalFormProps<Values = any> {
  beforeStart?: (val: Values) => void;
  createExtrinsic: (val: Values) => SubmittableExtrinsic<'promise', ISubmittableResult>;
  initialValues?: Partial<Values>;
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
  createExtrinsic,
  signer,
  onSuccess,
  onFail,
  beforeStart,
  onCancel,
}: PropsWithChildren<ModalFormProps<V>>) {
  const [form] = useForm<V>();
  const { api } = useApi();
  const { account } = useAccount();
  const { observer } = useTx();
  const { ...others } = modalProps;

  return (
    <Modal
      {...others}
      destroyOnClose={true}
      maskClosable={false}
      onOk={() => {
        from(form.validateFields())
          .pipe(
            catchError(() => NEVER),
            tap((value) => {
              if (beforeStart) {
                beforeStart(value);
              }
            }),
            switchMap((value) => {
              const ext = createExtrinsic(value);

              return signAndSendExtrinsic(api, signer ?? account, ext);
            })
          )
          .subscribe({
            ...observer,
            next: (value) => {
              observer.next(value);

              if (value.status === 'finalized' && onSuccess) {
                onSuccess(value);
              }
            },
            error: (err) => {
              observer.error(err);

              if (onFail) {
                onFail(err);
              }
            },
          });
      }}
      onCancel={onCancel}
    >
      <Form
        form={form}
        initialValues={initialValues ?? {}}
        layout="vertical"
        validateMessages={validateMessages[i18n.language as 'en' | 'zh-CN' | 'zh']}
      >
        {children}
      </Form>
    </Modal>
  );
}
