import { BarsOutlined } from '@ant-design/icons';
import { Drawer, Layout } from 'antd';
import AntdLink from 'antd/lib/typography/Link';
import { Steps } from 'intro.js-react';
import { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Route, Switch, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { ActiveAccount } from './components/widget/account/ActiveAccount';
import { Connection } from './components/widget/Connection';
import { Language } from './components/widget/Language';
import { getActiveNav, SideNav } from './components/widget/SideNav';
import { toggleTheme } from './components/widget/ThemeSwitch';
import { THEME } from './config';
import { routes } from './config/routes';
import { useApi } from './hooks';
import { PolkadotChainConfig } from './model';
import { readStorage, updateStorage } from './utils';

const { Sider, Content } = Layout;

function Logo({
  network,
  withText,
  className = '',
}: {
  network: PolkadotChainConfig;
  className?: string;
  withText?: boolean;
}) {
  return (
    <div className={`w-full flex gap-2 justify-between items-center ${className}`}>
      <img src={`/image/darwinia.svg`} className="w-8 lg:w-11" />
      {withText && (
        <>
          <h1 className="bg-darwinia text-transparent bg-clip-text text-sm lg:text-lg">Apps</h1>
          <span className={`px-2.5 py-0.5 rounded-lg text-white text-sm lg:text-base  bg-${network.name}`}>Lite</span>
        </>
      )}
    </div>
  );
}

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

    toggleTheme(THEME.LIGHT);
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
  const { network } = useApi();
  const [theme] = useState<THEME>(readStorage().theme ?? THEME.LIGHT);
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const activeNav = useMemo(() => getActiveNav(location.pathname), [location.pathname]);

  return (
    <Layout style={{ height: '100vh' }} className="overflow-hidden">
      <Sider theme={theme} trigger={null} collapsible collapsed={collapsed} className="hidden lg:block">
        <SideNav collapsed={collapsed} theme={theme} toggle={() => setCollapsed(!collapsed)}>
          <Logo withText={!collapsed} network={network} className="mb-4" />
        </SideNav>
      </Sider>

      <Drawer
        placement="right"
        onClose={() => setCollapsed(true)}
        closable={false}
        visible={!collapsed}
        bodyStyle={{ padding: 0 }}
        className="block lg:hidden"
      >
        <SideNav collapsed={collapsed} theme={theme} toggle={() => setCollapsed(!collapsed)} />
      </Drawer>

      <Layout className="overflow-scroll">
        <header className="flex justify-between items-center lg:p-8 p-4 sticky top-0 z-10 bg-gray-100 dark:bg-black">
          <div className="flex items-center">
            <div className={`lg:hidden flex items-center gap-2 mr-4 text-${network.name}-main text-xl`}>
              <BarsOutlined onClick={() => setCollapsed(!collapsed)} />
              <Logo withText network={network} />
            </div>

            <h2 className={`text-lg font-bold bg-${network.name} text-transparent hidden lg:block bg-clip-text`}>
              {t(activeNav.length ? activeNav[0].label : '')}
            </h2>
          </div>

          <div className="flex items-center gap-4 connection">
            <Connection />
            <ActiveAccount />

            <div className="hidden lg:flex items-center">
              {/* <ThemeSwitch mode="btn" network={network.name} onThemeChange={setTheme} /> */}
              <Language mode="icon" network={network.name} theme={theme} />
            </div>
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
