import keyring from '@polkadot/ui-keyring';
import { Modal } from 'antd';
import Link from 'antd/lib/typography/Link';
import { Trans } from 'react-i18next';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
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
  ConnectionType,
  ConnectionStatus,
  EthereumConnection,
  PolkadotConnection,
  AddEthereumChainParameter,
} from '../../model';
import { entrance } from './entrance';
import { isMetamaskInstalled, isNetworkConsistent } from './network';
import { switchMetamaskNetwork } from './switch';

type ConnectEthFn<T extends Connection> = (network: AddEthereumChainParameter, chainId?: string) => Observable<T>;

/**
 * keyring must be loaded before use
 */
keyring.loadAll({});

export const getPolkadotConnection: (network: ChainConfig) => Observable<PolkadotConnection> = (network) => {
  const type: ConnectionType = 'polkadot';

  const subject = new BehaviorSubject<PolkadotConnection>({
    type,
    status: ConnectionStatus.pending,
    api: null,
    accounts: [],
  });
  const source = subject.asObservable().pipe(distinctUntilKeyChanged('status'));

  const url = network.provider.rpc;
  const api = entrance.polkadot.getInstance(url);

  if (api.isConnected) {
    subject.next({ accounts: [], type, status: ConnectionStatus.success, api });
  }

  api.on('connected', () => {
    subject.next({ accounts: [], type, status: ConnectionStatus.success, api });
  });

  api.on('disconnected', () => {
    subject.next({ accounts: [], type, status: ConnectionStatus.connecting, api: null });
  });

  api.on('error', (error) => {
    console.error(error);
    subject.next({ accounts: [], type, status: ConnectionStatus.error, api: null });
  });

  return from(source).pipe(
    startWith<PolkadotConnection>({ accounts: [], status: ConnectionStatus.connecting, api: null, type })
  );
};

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

export const connectToEth: ConnectEthFn<EthereumConnection> = (network, chainId?) => {
  if (!isMetamaskInstalled()) {
    showWarning(
      'metamask',
      'https://chrome.google.com/webstore/detail/empty-title/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=zh-CN'
    );
    return EMPTY;
  }

  return from(isNetworkConsistent(network, chainId)).pipe(
    switchMap((isMatch) =>
      isMatch ? getEthereumConnection() : switchMetamaskNetwork(network).pipe(switchMapTo(getEthereumConnection()))
    )
  );
};
