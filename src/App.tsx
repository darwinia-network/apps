import { BarsOutlined } from '@ant-design/icons';
import { Drawer, Layout } from 'antd';
import AntdLink from 'antd/lib/typography/Link';
import { Steps } from 'intro.js-react';
import isMobile from 'is-mobile';
import { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Routes, Route, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Signer } from './components/widget/Signer';
import { QueueStatus } from './components/widget/QueueStatus';
import { ConnectWallet } from './components/widget/ConnectWallet';
import { ActiveAccount } from './components/widget/account/ActiveAccount';
import { Language } from './components/widget/Language';
import { getActiveNav, SideNav } from './components/widget/SideNav';
import { CrossChainDestinationSelector } from './components/widget/CrossChainDestinationSelector';
import { toggleTheme } from './components/widget/ThemeSwitch';
import { THEME } from './config';
import { routes } from './config/routes';
import { useApi, useFeeMarket } from './hooks';
import { readStorage, updateStorage } from './utils';

const { Sider, Content } = Layout;

function Logo({ withText, className = '' }: { className?: string; withText?: boolean }) {
  return (
    <div className={`w-full flex gap-2 items-center ${className}`}>
      <img src={`/image/darwinia.svg`} className="w-8 lg:w-11" />
      {withText && <h1 className="bg-darwinia text-transparent bg-clip-text text-sm lg:text-lg">Apps</h1>}
    </div>
  );
}

function IntroGuide() {
  const { t } = useTranslation();
  const { network } = useApi();
  const [stepsEnabled, setStepsEnabled] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = useMemo(() => {
    const stepConnection = {
      element: '.connection',
      title: t('Connect Wallet'),
      position: 'bottom-middle-aligned',
      intro: (
        <Trans>
          Please connect wallet to participate in Darwinia Apps.{' '}
          <AntdLink href="https://www.youtube.com/watch?v=mT7rUlQh660" target="_blank" rel="noopener noreferrer">
            Tutorial refers here.
          </AntdLink>
        </Trans>
      ),
      tooltipClass: 'intro-step-tooltip',
      highlightClass: 'intro-step-heighlight',
    };

    const stepMigration = {
      element: '.migration',
      title: t('Account Migration'),
      position: 'right',
      intro: (
        <Trans className="m-8">
          {`If your account in the old version cannot be found in your wallet, you can restore JSON which the account in the old version Apps through "Account Migration" and add the JSON to your wallet. `}
          <AntdLink
            href="https://darwinianetwork.medium.com/using-darwinia-tools-3-8-darwinia-apps-lite-guide-part-%E2%85%B0-account-ae9b3347b3c7"
            target="_blank"
            rel="noopener noreferrer"
          >
            Tutorial refers here.
          </AntdLink>
        </Trans>
      ),
      tooltipClass: 'intro-step-tooltip',
      highlightClass: 'intro-step-heighlight',
    };

    return [stepConnection, stepMigration];
  }, [t]);

  useEffect(() => {
    if (!isMobile()) {
      const index = readStorage().introIndex;
      if (index === 0) {
        setCurrentStep(1);
        setStepsEnabled(true);
      } else if (index === 1) {
        setStepsEnabled(false);
      } else {
        setStepsEnabled(true);
      }
    }

    toggleTheme(THEME.LIGHT, network.name);
  }, [network.name]);

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
      options={{
        showBullets: false,
        exitOnOverlayClick: false,
      }}
    />
  );
}

function App() {
  const { t } = useTranslation();
  const { network } = useApi();
  const { supportedDestinations, setDestination } = useFeeMarket();
  const [theme] = useState<THEME>(readStorage().theme ?? THEME.LIGHT);
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const activeNav = useMemo(() => getActiveNav(location.pathname), [location.pathname]);

  return (
    <>
      <Layout style={{ height: '100vh' }} className="overflow-hidden">
        <Sider theme={theme} trigger={null} collapsible collapsed={collapsed} className="hidden lg:block">
          <SideNav collapsed={collapsed} theme={theme} toggle={() => setCollapsed(!collapsed)}>
            <Logo withText={!collapsed} className="mb-4" />
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
                <Logo withText />
              </div>

              <div className="flex items-center space-x-3">
                <h2
                  className={`font-semibold not-italic text-2xl bg-${network.name} text-transparent hidden lg:block bg-clip-text`}
                >
                  {t(activeNav.length ? activeNav[0].label : '')}
                </h2>
                <CrossChainDestinationSelector destinations={supportedDestinations} onSelect={setDestination} />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ActiveAccount />
              {isMobile() ? null : <ConnectWallet />}

              <div className="hidden lg:flex items-center">
                {/* <ThemeSwitch mode="btn" network={network.name} onThemeChange={setTheme} /> */}
                <Language mode="icon" network={network.name} theme={theme} />
              </div>
            </div>
          </header>

          <Content>
            <TransitionGroup>
              <CSSTransition key={location.pathname} timeout={300} classNames="fade">
                <Routes>
                  {routes.map(({ path, PageComponent }) => (
                    <Route key={path} path={path} caseSensitive element={<PageComponent />} />
                  ))}
                </Routes>
              </CSSTransition>
            </TransitionGroup>
          </Content>
        </Layout>
        <IntroGuide />
      </Layout>
      <Signer />
      <QueueStatus />
    </>
  );
}

export default App;
