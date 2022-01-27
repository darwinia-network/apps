import { Button } from 'antd';
import { has } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useApi, useStaking } from '../../../hooks';

export function SetIdentity() {
  const { t } = useTranslation();
  const { api } = useApi();
  const { isValidating } = useStaking();

  return (
    <Button type="text" disabled={!has(api.tx.identity, 'setIdentity') && isValidating}>
      {t('Set on-chain identity')}
    </Button>
  );
}
