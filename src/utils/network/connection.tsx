import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import {
  BehaviorSubject,
  concatMap,
  distinctUntilKeyChanged,
  from,
  map,
  Observable,
  startWith,
  switchMap,
  switchMapTo,
} from 'rxjs';
import { ChainConfig, ConnectionStatus, PolkadotConnection } from '../../model';
import { entrance } from './entrance';

export const getPolkadotConnection: (network: ChainConfig) => Observable<PolkadotConnection> = (network) =>
  from(web3Enable('polkadot-js/apps')).pipe(
    concatMap((extensions) =>
      from(web3Accounts()).pipe(
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
