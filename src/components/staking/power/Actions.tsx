import { SettingFilled } from '@ant-design/icons';
import { Button, Dropdown, Menu } from 'antd';
import { useTranslation } from 'react-i18next';

export function Actions() {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2 items-center">
      <Button>{t('Session Key')}</Button>
      <Button>{t('Nominate')}</Button>
      <Dropdown
        overlay={
          <Menu>
            <Menu.Item>{t('Bond more funds')}</Menu.Item>
            <Menu.Item>{t('Rebond funds')}</Menu.Item>
            <Menu.Item>{t('Unbond funds')}</Menu.Item>
            <Menu.Item>{t('Lock extra')}</Menu.Item>
            <Menu.Item>{t('Change controller account')}</Menu.Item>
            <Menu.Item>{t('Change reward destination')}</Menu.Item>
            {/* nominate */}
            <Menu.Item>{t('Change session keys')}</Menu.Item>
            {/* stop nominating */}
            <Menu.Item>{t('Set nominees')}</Menu.Item>
          </Menu>
        }
      >
        <SettingFilled className="text-lg text-gray-600 cursor-pointer" />
      </Dropdown>
    </div>
  );
}
