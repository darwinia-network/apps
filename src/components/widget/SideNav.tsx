import { CaretLeftFilled } from '@ant-design/icons';
import { Menu, Select } from 'antd';
import { PropsWithChildren, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Network, PolkadotChainConfig, SearchParamsKey } from '../..//model';
import { THEME } from '../../config';
import { Path, routes } from '../../config/routes';
import { useApi, useBestNumber } from '../../hooks';
import { getNetworkByName, NETWORK_CONFIGURATIONS } from '../../utils';
import { AccountIcon, DarwiniaIcon, StakingIcon, ToolboxIcon, UsersIcon, ViewBrowserIcon } from '../icons';
import { IconProps } from '../icons/icon-factory';
import { BestNumber } from './BestNumber';
import { SubscanLink } from './SubscanLink';
import { toggleTheme } from './ThemeSwitch';

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

const { Option } = Select;

const NETWORKS_LIVE = NETWORK_CONFIGURATIONS.filter((item) => item.category === 'live');
const NETWORKS_TEST = NETWORK_CONFIGURATIONS.filter((item) => item.category === 'test');
const NETWORKS_PARACHAIN = NETWORK_CONFIGURATIONS.filter((item) => item.category === 'parachain');

const navigators: Nav[] = [
  { label: 'Account', path: Path.account, Icon: AccountIcon },
  { label: 'Staking', path: Path.staking, Icon: StakingIcon },
  { label: 'Toolbox', path: Path.toolbox, Icon: ToolboxIcon },
  { label: 'Darwinia Portal', path: Path.portal, Icon: DarwiniaIcon },
  { label: 'Account Migration', path: Path.migration, Icon: UsersIcon, className: 'migration' },
  // { label: 'Fee Market', path: Path.feemarket, Icon: ChartIcon },
];

export const getActiveNav = (path: string) => {
  return routes
    .filter((item) => path === item.path)
    .map((item) => {
      const urlPath = item.path === Path.root ? Path.account : (item.path as string);

      return navigators.find((nav) => nav.path.startsWith(urlPath));
    })
    .filter((item) => !!item) as Nav[];
};

// eslint-disable-next-line complexity
export function SideNav({ collapsed, theme, toggle, children }: PropsWithChildren<SideNavProps>) {
  const { t } = useTranslation();
  const { network, connectNetwork } = useApi();
  const { bestNumber } = useBestNumber();
  const location = useLocation();
  const selectedNavMenu = useMemo<string[]>(() => {
    const nav = getActiveNav(location.pathname);

    return [nav.length ? nav[0].path : ''];
  }, [location?.pathname]);

  const networkOptions = useMemo(() => {
    const ele = (config: PolkadotChainConfig) => (
      <Option value={config.name} key={config.name} className={`capitalize ${collapsed ? 'py-2' : ''}`}>
        <span className="flex items-center">
          <img
            src={config.facade.logo}
            className={`mr-2 rounded-full dark:bg-white ${collapsed ? 'collapsed h-4' : 'h-6'}`}
            alt=""
          />
          {!collapsed && (
            <span className="flex-1 flex justify-between items-center overflow-hidden overflow-ellipsis">
              <span className="capitalize mr-2">{config.name}</span>
            </span>
          )}
        </span>
      </Option>
    );

    return collapsed ? (
      <>
        {NETWORKS_LIVE.map((item) => ele(item))}
        {NETWORKS_TEST.map((item) => ele(item))}
        {NETWORKS_PARACHAIN.map((item) => ele(item))}
      </>
    ) : (
      <>
        <Select.OptGroup key="product" label={collapsed ? '' : t('Live networks')}>
          {NETWORKS_LIVE.map((item) => ele(item))}
        </Select.OptGroup>
        <Select.OptGroup key="test" label={collapsed ? '' : t('Test networks')}>
          {NETWORKS_TEST.map((item) => ele(item))}
        </Select.OptGroup>
        <Select.OptGroup key="parachain" label={collapsed ? '' : t('Parachain networks')}>
          {NETWORKS_PARACHAIN.map((item) => ele(item))}
        </Select.OptGroup>
      </>
    );
  }, [collapsed, t]);

  const searchParams = new URLSearchParams();
  searchParams.set(SearchParamsKey.RPC, encodeURIComponent(network.provider.rpc));

  return (
    <div className="h-screen max-h-screen flex flex-col items-stretch relative">
      <div className="p-4">
        {children}

        <Select
          defaultValue={network.name}
          onSelect={(value: Network) => {
            const config = getNetworkByName(value)!;

            connectNetwork(config);
            toggleTheme(theme, value);
          }}
          className={`w-full ${network.name}-${theme}-select`}
        >
          {networkOptions}
        </Select>
      </div>

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
        <div
          className="w-3/4 flex justify-between items-center rounded-2xl px-4 py-2 mx-auto mb-8 overflow-hidden"
          style={{ boxShadow: '0px 0px 24px rgba(191, 194, 234, 0.413501)' }}
        >
          <BestNumber bestNumber={bestNumber || 0} />
          {!collapsed && (
            <SubscanLink network={network.name} block={(bestNumber || 0).toString()}>
              <ViewBrowserIcon />
            </SubscanLink>
          )}
        </div>

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
          <a href="https://t.me/DarwiniaNetwork" target="_blank" rel="noreferrer">
            <img className="w-5" src="/image/social/telegram.svg" />
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
