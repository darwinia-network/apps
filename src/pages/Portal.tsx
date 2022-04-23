import { Alert, Card, Tabs, Button } from 'antd';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { useApi } from '../hooks';
import { readStorage, updateStorage } from '../utils';

type PortalData = {
  name: string;
  logo: string;
  description: string;
  link: string;
};

function Content({ name, logo, description, link }: PortalData) {
  return (
    <Card
      bordered={false}
      hoverable
      style={{ minHeight: 250 }}
      className="shadow-xxl transition-transform duration-300 transform hover:scale-105"
    >
      <div onClick={() => window.open(link, '_blank')} className="flex flex-col gap-4 items-center">
        <img src={logo} style={{ height: 70, borderRadius: '50%' }} />
        <b className="fond-bold text-lg">{name}</b>
        <p>{description}</p>
      </div>
    </Card>
  );
}

function Page() {
  const { t } = useTranslation();
  const { network } = useApi();
  const hidePortalWarning = !!readStorage().hidePortalWarning;

  const portalData = useMemo<PortalData[]>(
    () => [
      {
        name: 'polkadot{.js}',
        logo: '/image/portal/polkadot.svg',
        description: t(
          'A wallet built on the polkadot-js stack. This version is updated alongside any changes to the code and always has the latest features.'
        ),
        link: `https://polkadot.js.org/apps/?rpc=${encodeURIComponent(network.provider.rpc)}`,
      },
      {
        name: 'MetaMask',
        logo: '/image/portal/metamask.png',
        description: t('A crypto wallet & gateway to blockchain apps.'),
        link: 'https://metamask.io/',
      },
      {
        name: 'MathWallet',
        logo: '/image/portal/mathwallet.png',
        description: t(`World's First Insured Crypto Wallet.`),
        link: 'https://www.mathwallet.org/en-us/',
      },
      {
        name: 'Subscan',
        logo: '/image/portal/subscan.png',
        description: t('Subscan is aggregate Substrate ecological network High-precision Web3 explorer.'),
        link: 'https://www.subscan.io/',
      },
      {
        name: 'OnFinality',
        logo: '/image/portal/onfinality.png',
        description: t('OnFinality is a leading infrastructure service for some of the largest blockchain projects.'),
        link: 'https://onfinality.io/',
      },
      {
        name: 'Wormhole',
        logo: '/image/portal/darwinia.png',
        description: t('Cross-chain transfer of assets between multiple networks can be realized through Wormhole.'),
        link: 'https://wormhole.darwinia.network/',
      },
      {
        name: 'Celer',
        logo: '/image/portal/celer.png',
        description: t('Building the best inter-blockchain and cross-layer communication platform.'),
        link: 'https://cbridge.celer.network/#/transfer',
      },
      {
        name: 'Crust',
        logo: '/image/portal/crust.png',
        description: t('Web3.0 Storage for the Metaverse.'),
        link: 'https://crust.network/',
      },
      {
        name: 'Evolution Land',
        logo: '/image/portal/evolution-land.png',
        description: t('Evolution Land is the first Metaverse+Gamefi+cross-chain game.'),
        link: 'https://www.evolution.land/',
      },
      {
        name: 'Smart App',
        logo: '/image/portal/darwinia.png',
        description: t(
          'Projects in the Ethereum ecosystem can be easily migrated to the Darwinia network through Smart App.'
        ),
        link: 'https://smart.darwinia.network/',
      },
      {
        name: 'Subview',
        logo: '/image/portal/subview.png',
        description: t('A block explorer and analytics platform for Crab Smart Chain.'),
        link: 'https://subview.xyz/',
      },
      {
        name: 'SnowSwap',
        logo: '/image/portal/snowswap.png',
        description: t('Trade and earn without registration.'),
        link: 'https://snowswap.xyz/#/',
      },
    ],
    [t, network]
  );

  return (
    <div className="lg:px-8 px-4">
      {!hidePortalWarning && (
        <Alert
          message={t(
            'The links in the Darwinia Portal are provided as a convenience and for informational purposes only; Darwinia Apps bears no responsibility for the accuracy, legality, security or content of the external sites linked or for that of subsequent links. For any questions or comments surrounding any of the projects listed, please contact corresponding projects directly.'
          )}
          type="warning"
          closable
          showIcon
          closeText={<Button>{t('I know, do not show it anymore')}</Button>}
          onClose={() => {
            updateStorage({ hidePortalWarning: true });
          }}
          className="m-0 flex flex-col space-y-2 lg:flex-row lg:space-y-0"
        />
      )}

      <Tabs
        accessKey="overview"
        className={`px-0 w-full mx-auto dark:shadow-none dark:border-transparent pb-5 page-account-tabs page-account-tabs-${network.name}`}
      >
        <Tabs.TabPane tab={t('overview')} key="overview">
          <div className="mt-2 grid grid-cols-1 gap-x-0 gap-y-5 sm:grid-cols-2 sm:gap-x-3 sm:gap-y-5 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-8 xl:grid-cols-5">
            {portalData.map((item, index) => (
              <Content key={index} name={item.name} logo={item.logo} description={item.description} link={item.link} />
            ))}
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}

export const Portal = withRouter(Page);
