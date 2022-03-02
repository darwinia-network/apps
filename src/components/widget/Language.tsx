import { Button, ButtonProps, Dropdown, Menu } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NETWORK_THEME, THEME } from '../../config';
import { Network } from '../../model';
import { EarthIcon } from '../icons';

export interface LanguageProps extends ButtonProps {
  className?: string;
  color?: string;
  network?: Network;
  mode?: 'full' | 'icon' | 'text';
  theme?: THEME;
}

const lang: { name: string; short: string }[] = [
  { name: '中文', short: 'zh' },
  { name: 'English', short: 'en' },
];

// eslint-disable-next-line complexity
export function Language({
  network,
  color,
  theme = THEME.LIGHT,
  mode = 'full',
  className = '',
  ...other
}: LanguageProps) {
  const { t, i18n } = useTranslation();
  const [current, setCurrent] = useState(i18n.language.includes('-') ? i18n.language.split('-')[0] : i18n.language);
  const textColor = network ? 'text-' + network + '-main' : '';
  const calcColor = network && NETWORK_THEME[theme][network]['@project-primary'];

  return (
    <Dropdown
      overlay={
        <Menu>
          {lang.map((item) => (
            <Menu.Item
              onClick={() => {
                if (current !== item.name) {
                  setCurrent(item.short);
                  i18n.changeLanguage(item.short);
                }
              }}
              key={item.short}
            >
              {t(item.name)}
            </Menu.Item>
          ))}
        </Menu>
      }
      className={className}
    >
      {mode === 'icon' ? (
        <EarthIcon style={{ color: color ?? calcColor }} className="cursor-pointer" />
      ) : (
        <Button
          {...other}
          className={`${textColor} flex items-center justify-around uppercase`}
          icon={mode === 'full' && <EarthIcon style={{ color: color ?? calcColor }} />}
          style={{ color: color ?? calcColor }}
        >
          <span>{current === 'zh' ? '中文' : current}</span>
        </Button>
      )}
    </Dropdown>
  );
}
