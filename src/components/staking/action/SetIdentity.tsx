import { Button, Input } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import { has } from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useApi, useStaking } from '../../../hooks';
import { FormModal } from '../../widget/FormModal';

interface SetIdentityFormValues {
  displayName: string;
  legal: string;
  email: string;
  web: string;
  twitter: string;
  riot: string;
  [key: string]: string;
}

export function SetIdentity() {
  const { t } = useTranslation();
  const { api } = useApi();
  const { accountWithMeta } = useAccount();
  const [isVisible, setIsVisible] = useState(false);
  const { isValidating, updateValidators, updateStakingDerive } = useStaking();

  return (
    <>
      <Button
        type="text"
        disabled={!has(api.tx.identity, 'setIdentity') && isValidating}
        onClick={() => setIsVisible(true)}
      >
        {t('Set on-chain identity')}
      </Button>

      <FormModal<SetIdentityFormValues>
        modalProps={{ visible: isVisible, title: t('Register identity') }}
        onCancel={() => setIsVisible(false)}
        extrinsic={(values) => {
          const params = Object.entries(values).reduce((acc, [key, value]) => {
            const cur = { [value ? 'raw' : 'none']: value ? value : null };

            return { ...acc, [key.replace('Name', '')]: cur };
          }, {});
          return api.tx.identity.setIdentity(params);
        }}
        onSuccess={() => {
          setIsVisible(false);
          updateValidators();
          updateStakingDerive();
        }}
        initialValues={{
          displayName: accountWithMeta.meta?.name,
          legal: '',
          email: '',
          web: '',
          twitter: '',
          riot: '',
        }}
      >
        <FormItem
          name="displayName"
          label={t('Display name')}
          rules={[{ required: true }, { max: 32, type: 'string' }]}
        >
          <Input size="large" />
        </FormItem>

        <FormItem name="legalName" label={t('Legal name')} rules={[{ max: 32, type: 'string' }]}>
          <Input size="large" />
        </FormItem>

        <FormItem name="email" label={t('email')} rules={[{ type: 'email' }]}>
          <Input size="large" />
        </FormItem>

        <FormItem name="web" label={t('web')} rules={[{ max: 32, type: 'string' }]}>
          <Input size="large" />
        </FormItem>

        <FormItem name="twitter" label={t('twitter')} rules={[{ max: 32, type: 'string' }]}>
          <Input size="large" />
        </FormItem>

        <FormItem name="riotName" label={t('Riot name')} rules={[{ max: 32, type: 'string' }]}>
          <Input size="large" />
        </FormItem>
      </FormModal>
    </>
  );
}
