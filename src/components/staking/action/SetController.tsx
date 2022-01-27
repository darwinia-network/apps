import { Button } from 'antd';
import { useTranslation } from 'react-i18next';

export function SetController() {
  const { t } = useTranslation();

  return <Button type="text">{t('Change controller account')}</Button>;
}
