import { Button, Form, Input, Modal } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { validateMessages } from '../../config';
import i18n from '../../config/i18n';
import { useAccount, useApi } from '../../hooks';

export function SessionKey() {
  const { t } = useTranslation();
  const [form] = useForm();
  const { api } = useApi();
  const { account, accountWithMeta } = useAccount();
  const [isVisible, setIsVisible] = useState(false);
  const isSubstrateV2 = useMemo(() => !!Object.keys(api.consts).length, [api]);
  console.log('%c [ isSubstrateV2 ]-16', 'font-size:13px; background:pink; color:#bf2c9f;', isSubstrateV2);

  // sessionIds stashId

  /**
   * stakingAccount
   */

  return (
    <>
      <Button
        onClick={() => {
          setIsVisible(true);
        }}
      >
        {t('Session Key')}
      </Button>

      <Modal
        visible={isVisible}
        onCancel={() => {
          setIsVisible(false);
        }}
        okText={t('Set Session Key')}
        title={t('Set Session Key')}
      >
        <Form
          name="session"
          form={form}
          validateMessages={validateMessages[i18n.language as 'en' | 'zh-CN' | 'zh']}
          initialValues={{ account }}
        >
          <Form.Item name="account" label={t('Controller account')} rules={[{ required: true }]}>
            <Input disabled placeholder={`${accountWithMeta.meta?.name} - ${account}`} />
          </Form.Item>

          <Form.Item name="key" label={t('Keys from rotateKeys')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
