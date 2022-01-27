import { Button } from 'antd';
import { useTranslation } from 'react-i18next';

export function Rebond() {
  const { t } = useTranslation();

  return <Button type="text">{t('Rebond funds')}</Button>;
}
