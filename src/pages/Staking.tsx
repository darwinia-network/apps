import { QuestionCircleFilled, SettingFilled } from '@ant-design/icons';
import BaseIdentityIcon from '@polkadot/react-identicon';
import { Button, Card, Col, Row, Tabs, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { AssetOverview } from '../components/staking/AssetOverview';
import { useAccount, useDarwiniaAvailableBalances } from '../hooks';

function Page() {
  const { t } = useTranslation();
  const { account } = useAccount();
  const { availableBalance, getBalances } = useDarwiniaAvailableBalances();

  return (
    <Tabs className="px-8 w-full mx-auto dark:shadow-none dark:border-transparent">
      <Tabs.TabPane tab={t('Power Manager')} key="power">
        <Card>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <BaseIdentityIcon
                theme="substrate"
                size={42}
                className="mr-2 rounded-full border border-solid border-gray-100"
                value={account}
              />
              <span>{account}</span>
            </div>

            <SettingFilled className="text-lg text-gray-600 cursor-pointer" />
          </div>
        </Card>

        <Row gutter={32} className="mt-8">
          <Col span={8}>
            <div
              className="relative rounded-xl bg-white"
              style={{
                background: 'linear-gradient(-45deg, #fe3876 0%, #7c30dd 71%, #3a30dd 100%)',
              }}
            >
              <div className="flex justify-between items-center p-6">
                <div className="text-white font-bold pl-4">
                  <h2 className="text-white text-lg mb-4">{t('Power')}</h2>
                  <b className="text-xl">0</b>
                </div>
                <img src="/image/lightning.png" className="w-20" />
              </div>

              <Tooltip className="absolute top-4 right-4" title={t('POWER = your stake / total stake')}>
                <QuestionCircleFilled className="cursor-pointer text-white" />
              </Tooltip>
            </div>
          </Col>

          {availableBalance.map((item, index) => (
            <Col span={8} key={item.chainInfo?.symbol}>
              <AssetOverview asset={item} key={index} refresh={getBalances}></AssetOverview>
            </Col>
          ))}
        </Row>

        <Card className="mt-8">
          <h1 className="text-xl font-bold">{t('Get Power')}</h1>
          <ul className="leading-24 text-gray-400 list-decimal px-4 my-4">
            <li>
              {t(
                'You need to stake some KTON or RING to get POWER. The higher the POWER, the greater the share of reward.'
              )}
            </li>
            <li>{t('Please make sure that you have some excess RING in this account as gas fee.')}</li>
          </ul>

          <Button>{t('Staking now')}</Button>
        </Card>
      </Tabs.TabPane>
      <Tabs.TabPane tab={t('Staking Overview')} key="staking"></Tabs.TabPane>
      <Tabs.TabPane tab={t('Targets')} key="targets"></Tabs.TabPane>
      <Tabs.TabPane tab={t('Waiting')} key="waiting"></Tabs.TabPane>
      <Tabs.TabPane tab={t('Validator stats')} key="validator"></Tabs.TabPane>
    </Tabs>
  );
}

export const Staking = withRouter(Page);
