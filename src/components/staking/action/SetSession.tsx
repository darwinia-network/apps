import { Button, Input } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi, useStaking } from '../../../hooks';
import { FormModal } from '../../modal/FormModal';
import { AddressItem } from '../../widget/form-control/AddressItem';
import { Label } from '../../widget/form-control/Label';
import { StakingActionProps } from './interface';

interface SetSessionFormValues {
  controller: string;
  key: string;
  [key: string]: unknown;
}

export function SetSession({ label, type = 'text' }: StakingActionProps) {
  const { t } = useTranslation();
  const { api } = useApi();
  const { isControllerAccountOwner, isNominating, controllerAccount, stashAccount } = useStaking();
  const [isVisible, setIsVisible] = useState(false);
  const isSubstrateV2 = useMemo(() => !!Object.keys(api.consts).length, [api]);

  return !isNominating ? (
    <>
      <Button
        onClick={() => {
          setIsVisible(true);
        }}
        type={type}
        disabled={!isControllerAccountOwner}
      >
        {t(label ?? 'Session Key')}
      </Button>

      <FormModal<SetSessionFormValues>
        modalProps={{ visible: isVisible, title: t('Bond more funds') }}
        onCancel={() => setIsVisible(false)}
        extrinsic={(values) => {
          const { key } = values;

          return isSubstrateV2 ? api.tx.staking.setKeys([key, new Uint8Array()]) : api.tx.staking.setKey([key]);
        }}
        onSuccess={() => {
          setIsVisible(false);
        }}
        initialValues={{ controller: controllerAccount }}
      >
        <AddressItem name="controller" label="Controller account" disabled />

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
            <Input />
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
            <Input />
          </FormItem>
        )}
      </FormModal>
    </>
  ) : null;
}
