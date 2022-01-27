import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useStaking } from '../../../hooks';

export function Unbond() {
  const { t } = useTranslation();
  const { isControllerAccountOwner } = useStaking();

  return (
    <Button disabled={!isControllerAccountOwner} type="text">
      {t('Unbond funds')}
    </Button>
  );
}
