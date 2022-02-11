import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import keyring from '@polkadot/ui-keyring';
import { accounts as accountsObs } from '@polkadot/ui-keyring/observable/accounts';
import { Modal } from 'antd';
import Link from 'antd/lib/typography/Link';
import { Trans } from 'react-i18next';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  concatMap,
  distinctUntilKeyChanged,
  EMPTY,
  from,
  map,
  merge,
  Observable,
  Observer,
  of,
  startWith,
  switchMap,
  switchMapTo,
} from 'rxjs';
import {
  ChainConfig,
  Connection,
  ConnectionStatus,
  EthereumConnection,
  IAccountMeta,
  PolkadotConnection,
} from '../../model';
import { getAddressMeta } from '../helper';
import { entrance } from './entrance';
import { isMetamaskInstalled, isNetworkConsistent } from './network';
import { switchMetamaskNetwork } from './switch';

type ConnectFn<T extends Connection> = (network: ChainConfig, chainId?: string) => Observable<T>;

/**
 * keyring must be loaded before use
 */
keyring.loadAll({});

export const LOCAL = 'local';

export const getPolkadotConnection: (network: ChainConfig) => Observable<PolkadotConnection> = (network) =>
  from(web3Enable('polkadot-js/apps')).pipe(
    concatMap((extensions) =>
      combineLatest([from(web3Accounts()), accountsObs.subject.asObservable()], (injected, data) => {
        const keys = Object.keys(data);
        const injectedAddress = injected.map((item) => item.address);
        const source = keys.filter((key) => !injectedAddress.includes(key));

        const local: IAccountMeta[] = source.map((address) => {
          const meta = getAddressMeta(address);

          return {
            address,
            meta: { ...meta, source: LOCAL },
            json: data[address].json,
          };
        });

        return [...injected, ...local];
      }).pipe(
        map(
          (accounts) =>
            ({
              accounts: !extensions.length && !accounts.length ? [] : accounts,
              type: 'polkadot',
              status: 'pending',
            } as Exclude<PolkadotConnection, 'api'>)
        )
      )
    ),
    switchMap((envelop: Exclude<PolkadotConnection, 'api'>) => {
      const subject = new BehaviorSubject<PolkadotConnection>(envelop);
      const url = network.provider.rpc;
      const api = entrance.polkadot.getInstance(url);
      const source = subject.asObservable().pipe(distinctUntilKeyChanged('status'));

      if (api.isConnected) {
        subject.next({ ...envelop, status: ConnectionStatus.success, api });
      }

      api.on('connected', () => {
        subject.next({ ...envelop, status: ConnectionStatus.success, api });
      });

      api.on('disconnected', () => {
        subject.next({ ...envelop, status: ConnectionStatus.connecting, api });
      });

      api.on('error', (_) => {
        subject.next({ ...envelop, status: ConnectionStatus.error, api });
      });

      return from(api.isReady).pipe(switchMapTo(source));
    }),
    startWith<PolkadotConnection>({ status: ConnectionStatus.connecting, accounts: [], api: null, type: 'polkadot' })
  );

const getEthereumConnection: () => Observable<EthereumConnection> = () => {
  return from(window.ethereum.request({ method: 'eth_requestAccounts' })).pipe(
    switchMap((_) => {
      const addressToAccounts = (addresses: string[]) =>
        addresses.map((address) => ({ address, meta: { source: '' } }));

      const request: Observable<EthereumConnection> = combineLatest([
        from<string[][]>(window.ethereum.request({ method: 'eth_accounts' })),
        from<string>(window.ethereum.request({ method: 'eth_chainId' })),
      ]).pipe(
        map(([addresses, chainId]) => ({
          accounts: addressToAccounts(addresses),
          status: ConnectionStatus.success,
          chainId,
          type: 'metamask',
        }))
      );

      const obs = new Observable((observer: Observer<EthereumConnection>) => {
        window.ethereum.on('accountsChanged', (accounts: string[]) =>
          from<string>(window.ethereum.request({ method: 'eth_chainId' })).subscribe((chainId) => {
            observer.next({
              status: ConnectionStatus.success,
              accounts: addressToAccounts(accounts),
              type: 'metamask',
              chainId,
            });
          })
        );
        window.ethereum.on('chainChanged', (chainId: string) => {
          from<string[][]>(window.ethereum.request({ method: 'eth_accounts' })).subscribe((accounts) => {
            observer.next({
              status: ConnectionStatus.success,
              accounts: addressToAccounts(accounts),
              type: 'metamask',
              chainId,
            });
          });
        });
      });

      return merge(request, obs);
    }),
    catchError((_) => {
      return of<EthereumConnection>({ status: ConnectionStatus.error, accounts: [], type: 'metamask', chainId: '' });
    }),
    startWith<EthereumConnection>({ status: ConnectionStatus.connecting, accounts: [], type: 'metamask', chainId: '' })
  );
};

const showWarning = (plugin: string, downloadUrl: string) =>
  Modal.warn({
    title: <Trans>Missing Wallet Plugin</Trans>,
    content: (
      <Trans i18nKey="MissingPlugin">
        We need {{ plugin }} plugin to continue. Please
        <Link href={downloadUrl} target="_blank">
          {' '}
          Install{' '}
        </Link>
        or unlock it first.
      </Trans>
    ),
    okText: <Trans>OK</Trans>,
  });

export const connectToEth: ConnectFn<EthereumConnection> = (network, chainId?) => {
  if (!isMetamaskInstalled()) {
    showWarning(
      'metamask',
      'https://chrome.google.com/webstore/detail/empty-title/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=zh-CN'
    );
    return EMPTY;
  }

  return from(isNetworkConsistent(network.name, chainId)).pipe(
    switchMap((isMatch) =>
      isMatch ? getEthereumConnection() : switchMetamaskNetwork(network.name).pipe(switchMapTo(getEthereumConnection()))
    )
  );
};
