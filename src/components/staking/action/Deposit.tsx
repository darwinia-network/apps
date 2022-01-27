import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useStaking } from '../../../hooks';

export function Deposit() {
  const { t } = useTranslation();
  const { isControllerAccountOwner } = useStaking();

  return (
    <Button disabled={!isControllerAccountOwner} type="text">
      {t('Deposit')}
    </Button>
  );
}
