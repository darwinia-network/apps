import { Button, Input } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi, useStaking } from '../../../hooks';
import { FormModal } from '../../widget/FormModal';
import { AddressItem } from '../../widget/form-control/AddressItem';
import { Label } from '../../widget/form-control/Label';
import { StakingActionProps } from './interface';

interface SetSessionFormValues {
  controller: string;
  key: string;
  className?: string;
  [key: string]: unknown;
}

// eslint-disable-next-line complexity
export function SetSession({ label, disabled, type = 'text', className = '' }: StakingActionProps) {
  const { t } = useTranslation();
  const { api } = useApi();
  const { isNominating, isInElection, controllerAccount, stashAccount } = useStaking();
  const [isVisible, setIsVisible] = useState(false);
  const isSubstrateV2 = useMemo(() => !!Object.keys(api.consts).length, [api]);

  return !isNominating ? (
    <>
      <Button
        onClick={() => {
          setIsVisible(true);
        }}
        type={type}
        disabled={disabled || isInElection}
        className={className}
      >
        {t(label ?? 'Session Key')}
      </Button>

      <FormModal<SetSessionFormValues>
        modalProps={{ visible: isVisible, title: t('Set session key') }}
        onCancel={() => setIsVisible(false)}
        extrinsic={(values) => {
          const { key } = values;

          return isSubstrateV2 ? api.tx.session.setKeys(key, new Uint8Array()) : api.tx.session.setKey([key]);
        }}
        onSuccess={() => {
          setIsVisible(false);
        }}
        signer={controllerAccount}
        initialValues={{ controller: controllerAccount || undefined }}
      >
        <AddressItem name="controller" label="Controller account" disabled extra={null} />

        {isSubstrateV2 ? (
          <FormItem
            name="key"
            label={
              <Label
                text={t('Keys from rotateKeys')}
                info={t(
                  'Changing the key only takes effect at the start of the next session. The input here is generates from the author_rotateKeys command'
                )}
              />
            }
            rules={[{ required: true }]}
          >
            <Input size="large" />
          </FormItem>
        ) : (
          <FormItem
            name="key"
            label={
              <Label
                text={t('Session key (ed25519)')}
                info={t(
                  'Changing the key only takes effect at the start of the next session. If validating, it must be an ed25519 key.'
                )}
              />
            }
            rules={[
              { required: true },
              {
                validator(_, value: string) {
                  return value === stashAccount ? Promise.reject() : Promise.resolve();
                },

                message: t('For fund security, your session key should not match your stash key.'),
              },
            ]}
          >
            <Input size="large" />
          </FormItem>
        )}
      </FormModal>
    </>
  ) : null;
}
