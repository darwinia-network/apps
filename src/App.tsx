import { CaretLeftFilled, SettingFilled } from '@ant-design/icons';
import { Layout, Menu, Select } from 'antd';
import AntdLink from 'antd/lib/typography/Link';
import { Steps } from 'intro.js-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, Route, Switch, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
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
import { AccountSelect } from './components/modal/AccountSelect';
import { BestNumber } from './components/widget/BestNumber';
import { Connection } from './components/widget/Connection';
import { SubscanLink } from './components/widget/SubscanLink';
import { toggleTheme } from './components/widget/ThemeSwitch';
import { THEME } from './config';
import { Path, routes } from './config/routes';
import { useAccount, useApi } from './hooks';
import { Network, PolkadotChainConfig } from './model';
import { getNetworkByName, NETWORK_CONFIGURATIONS, readStorage, updateStorage } from './utils';
interface Nav {
  label: string;
  path: string;
  Icon: (Props: IconProps) => JSX.Element;
  className?: string;
}

const { Sider, Content } = Layout;
const { Option } = Select;

const navigators: Nav[] = [
  { label: 'Account', path: Path.account, Icon: AccountIcon },
  { label: 'Staking', path: Path.staking + '?active=power', Icon: StakingIcon },
  { label: 'Toolbox', path: Path.toolbox, Icon: ToolboxIcon },
  { label: 'Darwinia Portal', path: Path.portal, Icon: DarwiniaIcon },
  { label: 'Account Migration', path: Path.migration, Icon: UsersIcon, className: 'migration' },
];

function IntroGuide() {
  const { t } = useTranslation();
  const [stepsEnabled, setStepsEnabled] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const steps = useMemo(
    () => [
      {
        element: '.connection',
        title: t('Connect Wallet'),
        intro: (
          <Trans i18nKey="connectRefers">
            Please connect polkadot\u007b.js\u007d extension to participate in Darwinia Apps.{' '}
            <AntdLink>Tutorial refers here.</AntdLink>
          </Trans>
        ),
      },
      {
        element: '.migration',
        title: t('Account Migration'),
        position: 'right',
        intro: (
          <Trans i18nKey="migrateRefers" className="m-8">
            If your account in the old version cannot be found in your wallet, you can restore JSON which the account in
            the old version apps through \u0022 Account Migration \u0022 and add the JSON to polkadot\u007b.js\u007d.
            <AntdLink>Tutorial refers here.</AntdLink>
          </Trans>
        ),
      },
    ],
    [t]
  );

  useEffect(() => {
    const index = readStorage().introIndex;
    if (index === 0) {
      setStepsEnabled(true);
      setCurrentStep(1);
    } else if (index === 1) {
      setStepsEnabled(false);
    } else {
      setStepsEnabled(true);
    }
  }, []);

  return (
    <Steps
      enabled={stepsEnabled}
      steps={steps}
      initialStep={currentStep}
      onExit={(stepIndex) => {
        // may be not a Number
        if (typeof stepIndex === 'number') {
          updateStorage({ introIndex: stepIndex });
        }

        setStepsEnabled(false);
      }}
    />
  );
}

function App() {
  const { t } = useTranslation();
  const { network, setNetwork } = useApi();
  const { account } = useAccount();
  const [theme] = useState<THEME>(readStorage().theme ?? THEME.LIGHT);
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const selectedKeys = useMemo<string[]>(
    () =>
      routes
        .filter((item) => location.pathname === item.path)
        .map((item) => {
          const urlPath = item.path === Path.root ? Path.account : (item.path as string);

          return navigators.find((nav) => nav.path.startsWith(urlPath))?.path || '';
        }),
    [location?.pathname]
  );

  useEffect(() => {
    toggleTheme(theme, network.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout style={{ height: '100vh' }} className="overflow-hidden">
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
                updateStorage({ activeNetwork: config as PolkadotChainConfig });
              }}
              className={`w-full ${network.name}-select`}
            >
              {NETWORK_CONFIGURATIONS.map((config) => (
                <Option value={config.name} key={config.name} className="capitalize">
                  <span className="flex items-center">
                    <img src={config.facade.logo} className={`mr-2 h-6 ${collapsed ? 'collapsed' : ''}`} alt="" />
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

          <Menu theme={theme} mode="inline" defaultSelectedKeys={selectedKeys} className="flex-1">
            {navigators.map(({ Icon, path, label, className }) => (
              <Menu.Item icon={<Icon />} key={path} className={className}>
                <Link to={path}>{t(label)}</Link>
              </Menu.Item>
            ))}
          </Menu>

          <div className="w-full">
            <div
              className="w-3/4 flex justify-between items-center rounded-2xl px-4 py-2 mx-auto mb-8 overflow-hidden"
              style={{ boxShadow: '0px 0px 24px rgba(191, 194, 234, 0.413501)' }}
            >
              <BestNumber />
              {!collapsed && (
                <SubscanLink network={network.name} address={account}>
                  <ViewBrowserIcon />
                </SubscanLink>
              )}
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

      <Layout className="overflow-scroll">
        <header className="h-20 flex justify-between items-center p-8 sticky top-0 z-10 bg-gray-100">
          <h2 className={`text-lg font-bold bg-${network.name} text-transparent bg-clip-text`}>Account</h2>
          <div className="flex items-center gap-4 connection">
            <Connection />
            <AccountSelect />
            <SettingFilled className="text-lg text-gray-600 cursor-pointer" />
          </div>
        </header>

        <Content>
          <TransitionGroup>
            <CSSTransition key={location.pathname} timeout={300} classNames="fade">
              <Switch location={location}>
                {routes.map((item, index) => (
                  <Route key={index} {...item}></Route>
                ))}
              </Switch>
            </CSSTransition>
          </TransitionGroup>
        </Content>
      </Layout>

      <IntroGuide />
    </Layout>
  );
}

export default App;
