import { Button, Input } from 'antd';
import { useTranslation } from 'react-i18next';

export function Stats() {
  const { t } = useTranslation();
  return (
    <>
      <Input.Group size="large" className="mb-8 w-2/3" compact>
        <Input placeholder={t('validator to query')} style={{ width: 'calc(100% - 200px)' }} />
        <Button type="primary" size="large">
          query
        </Button>
      </Input.Group>
      <div>Graph here</div>
    </>
  );
}
