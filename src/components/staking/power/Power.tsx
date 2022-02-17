import { QuestionCircleFilled } from '@ant-design/icons';
import { Card, Col, Row, Tooltip } from 'antd';
import BN from 'bn.js';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, usePower, useStaking } from '../../../hooks';
import { assetToPower } from '../../../utils';
import { IdentAccountAddress } from '../../widget/account/IdentAccountAddress';
import { AssetOverview } from '../AssetOverview';
import { Actions } from './Actions';
import { Earnings } from './Earnings';
import { Nominating } from './Nominating';

export function Power() {
  const { t } = useTranslation();
  const [eraSelectionIndex, setEraSelectionIndex] = useState(0);
  const { accountWithMeta, assets, getBalances } = useAccount();
  const { stakingDerive, isStakingLedgerEmpty, stashAccount } = useStaking();
  const { pool } = usePower();

  const power = useMemo(() => {
    if (isStakingLedgerEmpty) {
      return assetToPower(new BN(0), new BN(0), pool.ring, pool.kton);
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { active, activeKton, activeRing } = stakingDerive.stakingLedger;

    return assetToPower(
      new BN((active || activeRing)?.toString()),
      new BN(activeKton.toString()),
      pool.ring,
      pool.kton
    );
  }, [pool, stakingDerive, isStakingLedgerEmpty]);

  return (
    <>
      <Card className="shadow-xxl">
        <div className="flex lg:flex-row flex-col lg:justify-between lg:items-center">
          <IdentAccountAddress account={accountWithMeta} className="mb-2 lg:mb-0" />

          {stashAccount && <Actions eraSelectionIndex={eraSelectionIndex} />}
        </div>
      </Card>

      {/* eslint-disable-next-line no-magic-numbers */}
      <Row gutter={[32, 32]} className="mt-8">
        <Col lg={8} span={24}>
          <div
            className="relative rounded-xl bg-white shadow-xxl"
            style={{
              background: 'linear-gradient(-45deg, #fe3876 0%, #7c30dd 71%, #3a30dd 100%)',
            }}
          >
            <div className="flex justify-between items-center p-6">
              <div className="text-white font-bold pl-4">
                <h2 className="text-white text-lg mb-4">{t('Power')}</h2>
                <b className="text-xl">{power.toString()}</b>
              </div>
              <img src="/image/lightning.png" className="w-20" />
            </div>

            <Tooltip className="absolute top-4 right-4" title={t('POWER = your stake / total stake')}>
              <QuestionCircleFilled className="cursor-pointer text-white" />
            </Tooltip>
          </div>
        </Col>

        {assets.map((item, index) => (
          <Col lg={8} span={24} key={item.token?.symbol || index}>
            <AssetOverview asset={item} key={index} refresh={getBalances}></AssetOverview>
          </Col>
        ))}
      </Row>

      <Earnings updateEraIndex={(idx) => setEraSelectionIndex(idx)} />

      <Nominating />
    </>
  );
}
