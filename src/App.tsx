import { BarsOutlined } from '@ant-design/icons';
import { Drawer, Layout } from 'antd';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Signer } from './components/widget/Signer';
import { QueueStatus } from './components/widget/QueueStatus';
import { getActiveNav, SideNav } from './components/widget/SideNav';
import { FeeMarketDestinationSelector } from './components/widget/FeeMarketDestinationSelector';
import { THEME } from './config';
import { routes } from './config/routes';
import { useApi, useFeeMarket } from './hooks';
import { readStorage } from './utils';

const { Sider, Content } = Layout;

function Logo({ withText, className = '' }: { className?: string; withText?: boolean }) {
  return (
    <div className={`w-full flex gap-2 items-center ${className}`}>
      <img src={`/image/apps.svg`} className="w-8 lg:w-11" />
      {withText && <h1 className="text-darwinia-main text-sm lg:text-lg">Apps</h1>}
    </div>
  );
}

function App() {
  const { t } = useTranslation();
  const { network } = useApi();
  const { destination, supportedDestinations, refresh, setDestination } = useFeeMarket();
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
                <FeeMarketDestinationSelector
                  destinations={supportedDestinations}
                  value={destination}
                  network={network.name}
                  onSelect={setDestination}
                  refresh={refresh}
                />
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
      </Layout>
      <Signer />
      <QueueStatus />
    </>
  );
}

export default App;
