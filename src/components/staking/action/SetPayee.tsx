import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useStaking } from '../../../hooks';

export function SetPayee() {
  const { t } = useTranslation();
  const { isControllerAccountOwner } = useStaking();

  return (
    <Button type="text" disabled={!isControllerAccountOwner}>
      {t('Change payee')}
    </Button>
  );
}
