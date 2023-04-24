import { CaretLeftFilled } from '@ant-design/icons';
import { Menu } from 'antd';
import { PropsWithChildren, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { SearchParamsKey } from '../../model';
import { THEME } from '../../config';
import { Path, routes } from '../../config/routes';
import { useApi } from '../../hooks';
import { DarwiniaIcon, ToolboxIcon } from '../icons';
import { IconProps } from '../icons/icon-factory';

interface SideNavProps {
  collapsed: boolean;
  theme: THEME;
  toggle: () => void;
}

interface Nav {
  label: string;
  path: string;
  Icon: (Props: IconProps) => JSX.Element;
  className?: string;
}

const navigators: Nav[] = [
  { label: 'Portal', path: Path.portal, Icon: DarwiniaIcon },
  // { label: 'Account', path: Path.account, Icon: AccountIcon },
  // { label: 'Staking', path: Path.staking, Icon: StakingIcon },
  { label: 'Toolbox', path: Path.toolbox, Icon: ToolboxIcon },
  // { label: 'Account Migration', path: Path.migration, Icon: UsersIcon, className: 'migration' },
  // { label: 'Fee Market', path: Path.feemarket, Icon: ChartIcon },
];

export const getActiveNav = (path: string) => {
  return routes
    .filter((item) => path === item.path)
    .map((item) => {
      const urlPath = item.path === Path.root ? Path.portal : (item.path as string);

      return navigators.find((nav) => nav.path.startsWith(urlPath));
    })
    .filter((item) => !!item) as Nav[];
};

// eslint-disable-next-line complexity
export function SideNav({ collapsed, theme, toggle, children }: PropsWithChildren<SideNavProps>) {
  const { t } = useTranslation();
  const { network } = useApi();
  const location = useLocation();
  const selectedNavMenu = useMemo<string[]>(() => {
    const nav = getActiveNav(location.pathname);

    return [nav.length ? nav[0].path : ''];
  }, [location?.pathname]);

  const searchParams = new URLSearchParams();
  searchParams.set(SearchParamsKey.RPC, encodeURIComponent(network.provider.rpc));

  return (
    <div className="h-screen max-h-screen flex flex-col items-stretch relative">
      <div className="p-4">{children}</div>

      <Menu
        theme={theme}
        mode="inline"
        defaultSelectedKeys={selectedNavMenu}
        className="flex-1"
        style={{ background: theme === THEME.DARK ? 'transparent' : 'inherit' }}
      >
        {navigators.map(({ Icon, path, label, className }) => (
          <Menu.Item icon={<Icon />} key={path} className={className}>
            <Link
              to={`${path}?${searchParams.toString()}`}
              className={`${collapsed ? 'text-white' : ''} ${
                path === selectedNavMenu[0] ? 'font-semibold' : 'font-normal'
              }`}
            >
              {t(label)}
            </Link>
          </Menu.Item>
        ))}
      </Menu>

      <div className="w-full">
        <div className="w-full flex flex-wrap items-center justify-around px-2 mb-2">
          {/* TODO: Icon can not display on drawer */}
          <a href="https://github.com/darwinia-network/apps" target="_blank" rel="noreferrer">
            <img className="w-5" src="/image/social/github.svg" />
          </a>
          <a href="https://twitter.com/DarwiniaNetwork" target="_blank" rel="noreferrer">
            <img className="w-5" src="/image/social/twitter.svg" />
          </a>
          <a href="https://medium.com/@darwinianetwork" target="_blank" rel="noreferrer">
            <img className="w-5" src="/image/social/medium.svg" />
          </a>
          <a href="https://discord.com/invite/VcYFYETrw5" target="_blank" rel="noreferrer">
            <img className="w-5" src="/image/social/discord.svg" />
          </a>
        </div>
      </div>

      <div
        onClick={toggle}
        className="absolute top-1/2 -right-3.5 transform -translate-y-8 h-16 border border-solid border-gray-200 border-l-0 rounded-r-lg lg:flex place-items-center bg-white cursor-pointer hidden"
        style={theme === THEME.DARK ? { background: '#0d101d', border: 'none' } : {}}
      >
        <CaretLeftFilled className={`light:opacity-40 transform ${collapsed ? 'rotate-180' : '0'}`} />
      </div>
    </div>
  );
}
