import { useEffect, useState, useRef, useCallback } from 'react';
import { Table, Input, Radio, Card } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import { NavLink } from 'react-router-dom';
import { from, switchMap, forkJoin, Subscription, EMPTY } from 'rxjs';
import type { Option, Vec } from '@polkadot/types';
import { BN, bnToBn } from '@polkadot/util';
import type { Balance, AccountId32 } from '@polkadot/types/interfaces';
import { useApolloClient } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import { getFeeMarketApiSection, fromWei, prettyNumber } from '../../utils';
import { useApi } from '../../hooks';
import { PalletFeeMarketRelayer, DarwiniaChain, SearchParamsKey, FeeMarketTab, RelayerEntity } from '../../model';
import { RELAYER_OVERVIEW } from '../../config';
import { IdentAccountName } from '../widget/account/IdentAccountName';

enum RelayerTab {
  ALL,
  ASSIGNED,
}

interface DataSourceState {
  relayer: string;
  orders: number;
  collateral: Balance;
  quote: Balance;
  reward: BN;
  slash: BN;
}

const renderBalance = (value: Balance | string | number, symbol: string): string =>
  bnToBn(value).isZero() ? '0' : `${fromWei({ value }, prettyNumber)} ${symbol}`;

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
  const dataSourceRef = useRef<DataSourceState[]>([]);
  const [activeKey, setActiveKey] = useState(RelayerTab.ALL);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<DataSourceState[]>([]);
  const [relayers, setRelayers] = useState<PalletFeeMarketRelayer[]>([]);

  const columns: ColumnsType<DataSourceState> = [
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
      key: 'orders',
      dataIndex: 'orders',
      align: 'center',
      sorter: (a, b) => a.orders - b.orders,
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
      key: 'reward',
      dataIndex: 'reward',
      align: 'center',
      render: (value) => renderBalance(value, network.tokens.ring.symbol),
      sorter: (a, b) => a.reward.cmp(b.reward),
    },
    {
      title: t('Sum(slash)'),
      key: 'slash',
      dataIndex: 'slash',
      align: 'center',
      render: (value) => renderBalance(value, network.tokens.ring.symbol),
      sorter: (a, b) => a.slash.cmp(b.slash),
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
      if (activeKey === RelayerTab.ALL) {
        setLoading(true);

        from(api.query[apiSection].relayers<Vec<AccountId32>>())
          .pipe(
            switchMap((res) =>
              forkJoin(res.map((item) => api.query[apiSection].relayersMap<PalletFeeMarketRelayer>(item)))
            )
          )
          .subscribe({
            next: (res) => {
              setLoading(false);
              setRelayers(res);
            },
            complete: () => setLoading(false),
          });
      } else if (activeKey === RelayerTab.ASSIGNED) {
        setLoading(true);

        from(api.query[apiSection].assignedRelayers<Option<Vec<PalletFeeMarketRelayer>>>()).subscribe((res) => {
          setLoading(false);
          setRelayers(res.isSome ? res.unwrap() : []);
        });
      }
    }

    return EMPTY.subscribe();
  }, [api, destination, activeKey]);

  useEffect(() => {
    let sub$$: Subscription;

    if (relayers.length) {
      setLoading(true);

      sub$$ = forkJoin(
        relayers.map((relayer) =>
          apollo.query<
            { relayer: Pick<RelayerEntity, 'totalOrders' | 'totalRewards' | 'totalSlashes'> | null },
            { relayerId: string }
          >({
            query: RELAYER_OVERVIEW,
            variables: { relayerId: `${destination}-${relayer.id.toString()}` },
          })
        )
      ).subscribe((res) => {
        dataSourceRef.current = res.map(({ data }, index) => {
          const relayer = relayers[index];
          return {
            relayer: relayer.id.toString(),
            orders: data.relayer?.totalOrders || 0,
            collateral: relayer.collateral,
            quote: relayer.fee,
            slash: bnToBn(data.relayer?.totalSlashes),
            reward: bnToBn(data.relayer?.totalRewards),
          };
        });
        setDataSource(dataSourceRef.current);
        setLoading(false);
      });
    } else {
      dataSourceRef.current = [];
      setDataSource([]);
    }

    return () => {
      setLoading(false);
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
        <Radio.Group onChange={(e) => setActiveKey(e.target.value)} value={activeKey}>
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
