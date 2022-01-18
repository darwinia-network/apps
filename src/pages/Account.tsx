import { Button, Card, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { from, zip } from 'rxjs';
import { AssetDetail } from '../components/AssetDetail';
import { Asset, AssetOverview } from '../components/widget/AssetOverview';
import { useAccount, useApi, useDarwiniaAvailableBalances } from '../hooks';

function Page() {
  const { t } = useTranslation();
  const { api } = useApi();
  const { account } = useAccount();
  const [availableBalance, setAvailableBalance] = useState<Asset[]>([]);
  const getBalance = useDarwiniaAvailableBalances();

  useEffect(() => {
    if (!api || !api.isConnected) {
      return;
    }

    const sub$$ = zip([from(getBalance(account)), from(api.query.system.account(account))]).subscribe(
      ([available, res]) => {
        const { data } = res.toJSON() as {
          data: { free: number; freeKton: number; reserved: number; reservedKton: number };
        };
        const { free, freeKton } = data;
        const [ring, kton] = available;

        setAvailableBalance([
          { ...ring, total: free },
          { ...kton, total: freeKton },
        ]);
      }
    );

    return () => {
      sub$$.unsubscribe();
    };
  }, [account, api, getBalance]);

  return (
    <Tabs className="px-8 w-full mx-auto dark:shadow-none dark:border-transparent">
      <Tabs.TabPane tab={t('Darwinia Asset')} key="asset">
        <div className="grid grid-cols-2 gap-8 mb-8">
          {availableBalance.map((item, index) => (
            <AssetOverview asset={item} key={index}></AssetOverview>
          ))}
        </div>
        <div>
          <AssetDetail />
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
