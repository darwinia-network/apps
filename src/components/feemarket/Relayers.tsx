import { useEffect, useState } from 'react';
import { Table, Input, Radio, Card } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import { NavLink } from 'react-router-dom';
import { from, switchMap, forkJoin, Subscription, timer, tap } from 'rxjs';
import type { Option, Vec } from '@polkadot/types';
import { BN } from '@polkadot/util';
import type { Balance, AccountId32 } from '@polkadot/types/interfaces';
import { useApolloClient } from '@apollo/client';
import { getFeeMarketModule, fromWei, prettyNumber } from '../../utils';
import { useApi, useFeeMarket } from '../../hooks';
import type { PalletFeeMarketRelayer } from '../../model';
import { LONG_LONG_DURATION, QUERY_RELAYER } from '../../config';
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

export const Relayers = () => {
  const { api, network } = useApi();
  const apollo = useApolloClient();
  const { destination } = useFeeMarket();
  const [tab, setTab] = useState(RelayerTab.ALL);
  const [loading, setLoaing] = useState(false);
  const [relayers, setRelayers] = useState<PalletFeeMarketRelayer[]>([]);
  const [dataSource, setDataSource] = useState<RelayerData[]>([]);

  const columns: ColumnsType<RelayerData> = [
    {
      title: 'Relayer',
      key: 'relayer',
      dataIndex: 'relayer',
      render: (value) => {
        const searchParams = new URL(window.location.href).searchParams;
        searchParams.set('relayer', value);
        searchParams.set('dest', destination);
        return (
          <NavLink to={`?${searchParams.toString()}`}>
            <IdentAccountName account={value} iconSize={24} />
          </NavLink>
        );
      },
    },
    {
      title: 'Count(orders)',
      key: 'countOrders',
      dataIndex: 'countOrders',
      sorter: (a, b) => a.countOrders - b.countOrders,
    },
    {
      title: 'Collateral',
      key: 'collateral',
      dataIndex: 'collateral',
      render: (value) => renderBalance(value, network.tokens.ring.symbol),
      sorter: (a, b) => a.collateral.cmp(b.collateral),
    },
    {
      title: 'Quote',
      key: 'quote',
      dataIndex: 'quote',
      render: (value) => renderBalance(value, network.tokens.ring.symbol),
      sorter: (a, b) => a.quote.cmp(b.quote),
    },
    {
      title: 'Sum(reward)',
      key: 'sumReward',
      dataIndex: 'sumReward',
      render: (value) => renderBalance(value, network.tokens.ring.symbol),
      sorter: (a, b) => a.sumReward.cmp(b.sumReward),
    },
    {
      title: 'Sum(slash)',
      key: 'sumSlash',
      dataIndex: 'sumSlash',
      render: (value) => renderBalance(value, network.tokens.ring.symbol),
      sorter: (a, b) => a.sumSlash.cmp(b.sumSlash),
    },
  ];

  useEffect(() => {
    let sub$$: Subscription;

    if (tab === RelayerTab.ALL) {
      sub$$ = timer(0, LONG_LONG_DURATION)
        .pipe(
          tap(() => setLoaing(true)),
          switchMap(() => from(api.query[getFeeMarketModule(destination)].relayers<Vec<AccountId32>>())),
          switchMap((res) =>
            forkJoin(
              res.map((item) => api.query[getFeeMarketModule(destination)].relayersMap<PalletFeeMarketRelayer>(item))
            )
          )
        )
        .subscribe((res) => {
          setLoaing(false);
          setRelayers(res);
        });
    } else if (tab === RelayerTab.ASSIGNED) {
      sub$$ = timer(0, LONG_LONG_DURATION)
        .pipe(
          tap(() => setLoaing(true)),
          switchMap(() =>
            from(api.query[getFeeMarketModule(destination)].assignedRelayers<Option<Vec<PalletFeeMarketRelayer>>>())
          )
        )
        .subscribe((res) => {
          setLoaing(false);
          setRelayers(res.isSome ? res.unwrap() : []);
        });
    }

    return () => {
      if (sub$$) {
        sub$$.unsubscribe();
      }
    };
  }, [api, destination, tab]);

  useEffect(() => {
    if (!relayers.length) {
      setDataSource([]);
      return;
    }

    setLoaing(true);

    const sub$$ = forkJoin(
      relayers.map((relayer) =>
        apollo.query({
          query: QUERY_RELAYER,
          variables: { relayer: `${destination}-${relayer.id.toString()}` },
        })
      )
    ).subscribe(
      (
        res: {
          data: null | {
            relayerEntity: null | {
              totalOrders: null | number;
              totalSlashs: null | string;
              totalRewards: null | string;
            };
          };
        }[]
      ) => {
        setDataSource(
          res.map(({ data }, index) => {
            const orders = data?.relayerEntity?.totalOrders || 0;
            const slashs = data?.relayerEntity?.totalSlashs || '0';
            const rewards = data?.relayerEntity?.totalRewards || '0';

            const relayer = relayers[index];

            return {
              relayer: relayer.id.toString(),
              countOrders: orders,
              collateral: relayer.collateral,
              quote: relayer.fee,
              sumReward: new BN(rewards),
              sumSlash: new BN(slashs),
            };
          })
        );
        setLoaing(false);
      }
    );

    return () => sub$$.unsubscribe();
  }, [apollo, destination, relayers]);

  return (
    <>
      <div className="flex items-end justify-between">
        <Radio.Group onChange={(e) => setTab(e.target.value)} value={tab}>
          <Radio.Button value={RelayerTab.ALL}>All Relayers</Radio.Button>
          <Radio.Button value={RelayerTab.ASSIGNED}>Assigned Relayers</Radio.Button>
        </Radio.Group>
        <Input size="large" className="mb-2 w-96" placeholder="Filter by relayer address" />
      </div>
      <Card className="mt-2">
        <Table columns={columns} dataSource={dataSource} rowKey="relayer" loading={loading} />
      </Card>
    </>
  );
};
