import { useEffect, useState, useRef, useCallback } from 'react';
import { Table, Input, Radio, Card } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import { NavLink } from 'react-router-dom';
import { from, switchMap, forkJoin, Subscription, EMPTY } from 'rxjs';
import type { Option, Vec } from '@polkadot/types';
import { BN } from '@polkadot/util';
import type { Balance, AccountId32 } from '@polkadot/types/interfaces';
import { useApolloClient } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import { getFeeMarketApiSection, fromWei, prettyNumber } from '../../utils';
import { useApi } from '../../hooks';
import { PalletFeeMarketRelayer, DarwiniaChain, SearchParamsKey, FeeMarketTab, TRelayerOverview } from '../../model';
import { RELAYER_OVERVIEW } from '../../config';
import { IdentAccountName } from '../widget/account/IdentAccountName';

type RelayerData = {
  relayer: string;
  countOrders: number;
  collateral: Balance;
  quote: Balance;
  sumReward: BN;
  sumSlash: BN;
};

enum RelayerTab {
  ALL,
  ASSIGNED,
}

const renderBalance = (value: Balance | string | number, symbol: string): string =>
  new BN(value).isZero() ? fromWei({ value }, prettyNumber) : `${fromWei({ value }, prettyNumber)} ${symbol}`;

export const Relayers = ({
  destination,
  setRefresh,
}: {
  destination: DarwiniaChain;
  setRefresh: (fn: () => void) => void;
}) => {
  const { api, network } = useApi();
  const apollo = useApolloClient();
  const { t } = useTranslation();
  const [tab, setTab] = useState(RelayerTab.ALL);
  const [loading, setLoaing] = useState(false);
  const [relayers, setRelayers] = useState<PalletFeeMarketRelayer[]>([]);
  const [dataSource, setDataSource] = useState<RelayerData[]>([]);
  const dataSourceRef = useRef<RelayerData[]>([]);

  const columns: ColumnsType<RelayerData> = [
    {
      title: (
        <div className="flex justify-center">
          <span>{t('Relayer')}</span>
        </div>
      ),
      key: 'relayer',
      dataIndex: 'relayer',
      render: (value) => {
        const searchParams = new URLSearchParams();
        searchParams.set(SearchParamsKey.RPC, encodeURIComponent(network.provider.rpc));
        searchParams.set(SearchParamsKey.DESTINATION, destination);
        searchParams.set(SearchParamsKey.TAB, FeeMarketTab.RELAYERS);
        searchParams.set(SearchParamsKey.RELAYER, value);
        return (
          <NavLink to={`?${searchParams.toString()}`}>
            <IdentAccountName account={value} iconSize={24} />
          </NavLink>
        );
      },
    },
    {
      title: t('Count(orders)'),
      key: 'countOrders',
      dataIndex: 'countOrders',
      align: 'center',
      sorter: (a, b) => a.countOrders - b.countOrders,
    },
    {
      title: t('Collateral'),
      key: 'collateral',
      dataIndex: 'collateral',
      align: 'center',
      render: (value) => renderBalance(value, network.tokens.ring.symbol),
      sorter: (a, b) => a.collateral.cmp(b.collateral),
    },
    {
      title: t('Quote'),
      key: 'quote',
      dataIndex: 'quote',
      align: 'center',
      render: (value) => renderBalance(value, network.tokens.ring.symbol),
      sorter: (a, b) => a.quote.cmp(b.quote),
    },
    {
      title: t('Sum(reward)'),
      key: 'sumReward',
      dataIndex: 'sumReward',
      align: 'center',
      render: (value) => renderBalance(value, network.tokens.ring.symbol),
      sorter: (a, b) => a.sumReward.cmp(b.sumReward),
    },
    {
      title: t('Sum(slash)'),
      key: 'sumSlash',
      dataIndex: 'sumSlash',
      align: 'center',
      render: (value) => renderBalance(value, network.tokens.ring.symbol),
      sorter: (a, b) => a.sumSlash.cmp(b.sumSlash),
    },
  ];

  const handleFilterChange = useCallback((e) => {
    if (e.target.value) {
      setDataSource(
        dataSourceRef.current.filter((item) => item.relayer.toLowerCase().includes(e.target.value.toLowerCase()))
      );
    } else {
      setDataSource(dataSourceRef.current);
    }
  }, []);

  const updateRelayers = useCallback(() => {
    const apiSection = getFeeMarketApiSection(api, destination);

    if (apiSection) {
      if (tab === RelayerTab.ALL) {
        setLoaing(true);

        from(api.query[apiSection].relayers<Vec<AccountId32>>())
          .pipe(
            switchMap((res) =>
              forkJoin(res.map((item) => api.query[apiSection].relayersMap<PalletFeeMarketRelayer>(item)))
            )
          )
          .subscribe((res) => {
            setLoaing(false);
            setRelayers(res);
          });
      } else if (tab === RelayerTab.ASSIGNED) {
        setLoaing(true);

        from(api.query[apiSection].assignedRelayers<Option<Vec<PalletFeeMarketRelayer>>>()).subscribe((res) => {
          setLoaing(false);
          setRelayers(res.isSome ? res.unwrap() : []);
        });
      }
    }

    return EMPTY.subscribe();
  }, [api, destination, tab]);

  useEffect(() => {
    let sub$$: Subscription;

    if (relayers.length) {
      setLoaing(true);

      sub$$ = forkJoin(
        relayers.map((relayer) =>
          apollo.query<TRelayerOverview, { relayerId: string }>({
            query: RELAYER_OVERVIEW,
            variables: { relayerId: `${destination}-${relayer.id.toString()}` },
          })
        )
      ).subscribe((res) => {
        dataSourceRef.current = res.map(({ data }, index) => {
          const relayer = relayers[index];
          const orders = data.relayer?.totalOrders || 0;
          const slashs = data.relayer?.totalSlashs || '0';
          const rewards = data.relayer?.totalRewards || '0';

          return {
            relayer: relayer.id.toString(),
            countOrders: orders,
            collateral: relayer.collateral,
            quote: relayer.fee,
            sumReward: new BN(rewards),
            sumSlash: new BN(slashs),
          };
        });
        setDataSource(dataSourceRef.current);
        setLoaing(false);
      });
    } else {
      setDataSource([]);
    }

    return () => {
      sub$$?.unsubscribe();
    };
  }, [relayers, apollo, destination]);

  useEffect(() => {
    setRefresh(() => () => {
      updateRelayers();
    });
  }, [setRefresh, updateRelayers]);

  useEffect(() => {
    const sub$$ = updateRelayers();
    return () => sub$$.unsubscribe();
  }, [updateRelayers]);

  return (
    <>
      <div className="flex items-end justify-between">
        <Radio.Group onChange={(e) => setTab(e.target.value)} value={tab}>
          <Radio.Button value={RelayerTab.ALL}>
            <span className="relayers-sub-tab">{t('All Relayers')}</span>
          </Radio.Button>
          <Radio.Button value={RelayerTab.ASSIGNED}>
            <span className="relayers-sub-tab">{t('Assigned Relayers')}</span>
          </Radio.Button>
        </Radio.Group>
        <Input
          size="large"
          className="mb-2 w-96"
          placeholder={t('Filter by relayer address')}
          onChange={handleFilterChange}
        />
      </div>
      <Card className="mt-2">
        <Table columns={columns} dataSource={dataSource} rowKey="relayer" loading={loading} />
      </Card>
    </>
  );
};
