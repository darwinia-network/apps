import { Button, Card, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { AccountHistory } from '../components/history-record/AccountHistory';
import { AssetOverview } from '../components/widget/AssetOverview';
import { useDarwiniaAvailableBalances } from '../hooks';

function Page() {
  const { t } = useTranslation();
  const { availableBalance, getBalances } = useDarwiniaAvailableBalances();

  return (
    <Tabs className="px-8 w-full mx-auto dark:shadow-none dark:border-transparent">
      <Tabs.TabPane tab={t('Darwinia Asset')} key="asset">
        <div className="grid grid-cols-2 gap-8 mb-8">
          {availableBalance.map((item, index) => (
            <AssetOverview asset={item} key={index} refresh={getBalances}></AssetOverview>
          ))}
        </div>
        <div>
          <AccountHistory tokens={availableBalance.map((item) => item.chainInfo)} />
        </div>
      </Tabs.TabPane>

      <Tabs.TabPane tab={t('Cross Chain')} key="cross">
        <Card>
          <p className="mb-4 opacity-60">
            {t('You can transfer RING/KTON through the cross-chain bridge between Ethereum and Darwinia.')}
          </p>
          <Button
            type="primary"
            onClick={() => {
              window.open('https://wormhole.darwinia.network', '_blank');
            }}
          >
            {t('Go to Wormhole')}
          </Button>
        </Card>
      </Tabs.TabPane>
    </Tabs>
  );
}

export const Account = withRouter(Page);
