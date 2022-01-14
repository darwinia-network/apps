import { CaretLeftFilled, SettingFilled } from '@ant-design/icons';
import { Button, Layout, Menu, Select, Tooltip } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Route, Switch, useLocation } from 'react-router-dom';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import {
  AccountIcon,
  DarwiniaIcon,
  GithubIcon,
  MediumIcon,
  StakingIcon,
  TelegramIcon,
  ToolboxIcon,
  TwitterIcon,
  UsersIcon,
  ViewBrowserIcon,
} from './components/icons';
import { IconProps } from './components/icons/icon-factory';
import { toggleTheme } from './components/widget/ThemeSwitch';
import { THEME } from './config';
import { Path, routes } from './config/routes';
import { useApi } from './hooks';
import { Network } from './model';
import { getNetworkByName, NETWORK_CONFIGURATIONS, readStorage } from './utils';

interface Nav {
  label: string;
  path: Path;
  Icon: (Props: IconProps) => JSX.Element;
}

const { Sider, Content } = Layout;
const { Option } = Select;

const navigators: Nav[] = [
  { label: 'Account', path: Path.account, Icon: AccountIcon },
  { label: 'Staking', path: Path.staking, Icon: StakingIcon },
  { label: 'Toolbox', path: Path.toolbox, Icon: ToolboxIcon },
  { label: 'Darwinia Portal', path: Path.portal, Icon: DarwiniaIcon },
  { label: 'Account Migration', path: Path.migration, Icon: UsersIcon },
];

function App() {
  const { t } = useTranslation();
  const { network, setNetwork } = useApi();
  const [theme] = useState<THEME>(readStorage().theme ?? THEME.LIGHT);
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout>
      <Sider theme={theme} trigger={null} collapsible collapsed={collapsed}>
        <div className="h-screen max-h-screen flex flex-col items-stretch relative">
          <div className="p-4">
            <div className="w-full mb-4 flex justify-between items-center">
              <img src={`/image/darwinia.svg`} className="w-11" />
              {!collapsed && (
                <>
                  <h1 className="bg-darwinia text-transparent bg-clip-text text-lg">Apps</h1>
                  <span className={`px-2.5 py-0.5 rounded-lg text-white  bg-${network.name}`}>Lite</span>
                </>
              )}
            </div>

            <Select
              defaultValue={network.name}
              onSelect={(value: Network) => {
                const config = getNetworkByName(value)!;

                setNetwork(config);
                toggleTheme(theme, value);
              }}
              className={`w-full ${network.name}-select`}
            >
              {NETWORK_CONFIGURATIONS.map((config) => (
                <Option value={config.name} key={config.name} className="capitalize">
                  <span className="flex items-center">
                    <img
                      src={config.facade.logo}
                      className={`h-4 mr-2 transform ${collapsed ? '-translate-x-2' : 'translate-x-0 h-6'}`}
                      alt=""
                    />
                    {!collapsed && (
                      <span className="flex-1 flex justify-between items-center overflow-hidden overflow-ellipsis">
                        <span className="capitalize mr-2">{config.name}</span>
                      </span>
                    )}
                  </span>
                </Option>
              ))}
            </Select>
          </div>

          <Menu theme={theme} mode="inline" defaultSelectedKeys={['1']} className="flex-1">
            {navigators.map(({ Icon, path, label }, idx) => (
              <Menu.Item icon={<Icon />} key={path + '_' + idx}>
                <Link to={path}>{t(label)}</Link>
              </Menu.Item>
            ))}
          </Menu>

          <div className="w-full">
            <div
              className="w-3/4 flex justify-between items-center rounded-2xl px-4 py-2 mx-auto mb-8 overflow-hidden"
              style={{ boxShadow: '0px 0px 24px rgba(191, 194, 234, 0.413501)' }}
            >
              <Tooltip title={`#6,029,137`}>
                <span className="max-w-full overflow-hidden">#6,029,137</span>
              </Tooltip>
              {!collapsed && <ViewBrowserIcon />}
            </div>
            <div className="w-full flex flex-wrap items-center justify-between p-4">
              <a>
                <GithubIcon className="mb-4" />
              </a>
              <a>
                <TwitterIcon className="mb-4" />
              </a>
              <a>
                <MediumIcon className="mb-4" />
              </a>
              <a>
                <TelegramIcon className="mb-4" />
              </a>
            </div>
          </div>

          <div
            onClick={() => setCollapsed(!collapsed)}
            className="absolute top-1/2 -right-3.5 transform -translate-y-8 h-16 border border-solid border-gray-200 border-l-0 rounded-r-2xl flex place-items-center bg-white cursor-pointer"
          >
            <CaretLeftFilled className={`opacity-40 transform ${collapsed ? 'rotate-180' : '0'}`} />
          </div>
        </div>
      </Sider>

      <Layout>
        <header className="h-20 flex justify-between items-center px-8">
          <h2 className={`text-lg font-bold bg-${network.name} text-transparent bg-clip-text`}>Account</h2>
          <div>
            <Button type="primary" className="mr-4">
              Connect Wallet
            </Button>
            <SettingFilled className="text-lg text-gray-600 cursor-pointer" />
          </div>
        </header>

        <SwitchTransition mode="out-in">
          <CSSTransition
            key={location.key}
            addEndListener={(node, done) => node.addEventListener('transitionend', done, false)}
            timeout={300}
            classNames="fade"
          >
            <Content>
              <Switch location={location}>
                {routes.map((item, index) => (
                  <Route key={index} {...item}></Route>
                ))}
              </Switch>
            </Content>
          </CSSTransition>
        </SwitchTransition>
      </Layout>
    </Layout>
  );
}

export default App;
