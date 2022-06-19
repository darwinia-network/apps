import { ApiPromise } from '@polkadot/api';
import { Alert } from 'antd';
import { createContext, useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY, Subscription, from } from 'rxjs';
import keyring from '@polkadot/ui-keyring';
import type { u32 } from '@polkadot/types-codec';
import type { ChainProperties } from '@polkadot/types/interfaces';
import { BallScalePulse } from '../components/widget/BallScalePulse';
import { crabConfig, THEME } from '../config';
import {
  Chain,
  Token,
  Action,
  Network,
  ChainConfig,
  Connection,
  ConnectionStatus,
  PolkadotChainConfig,
  PolkadotConnection,
} from '../model';
import { convertToSS58, getPolkadotConnection, readStorage, updateStorage, getNetworkByName } from '../utils';

interface StoreState {
  connection: Connection;
  network: PolkadotChainConfig;
  isDev: boolean;
}

type ActionType = 'setNetwork' | 'setConnection';

const isDev = process.env.REACT_APP_HOST_TYPE === 'dev';

const extractTokens = ({ tokenDecimals, tokenSymbol }: ChainProperties) =>
  tokenDecimals.isSome && tokenSymbol.isSome
    ? tokenDecimals.unwrap().reduce((acc: Token[], decimal: u32, index: number) => {
        const token: Token = { decimal: decimal.toString(), symbol: tokenSymbol.unwrap()[index].toString() };
        return [...acc, token];
      }, [])
    : [];

const getInitNetwork = () => {
  const name = new URL(window.location.href).searchParams.get('network');
  return (getNetworkByName(name as Network) ?? readStorage().activeNetwork ?? crabConfig) as PolkadotChainConfig;
};

const initialConnection: Connection = {
  status: ConnectionStatus.pending,
  type: 'unknown',
  accounts: [],
  chainId: '',
};

const initialState: StoreState = {
  connection: initialConnection,
  network: getInitNetwork(),
  isDev,
};

// eslint-disable-next-line complexity, @typescript-eslint/no-explicit-any
function accountReducer(state: StoreState, action: Action<ActionType, any>): StoreState {
  switch (action.type) {
    case 'setNetwork': {
      updateStorage({ activeNetwork: action.payload });
      return { ...state, network: action.payload };
    }

    case 'setConnection': {
      const { accounts, ...rest } = action.payload as Connection;

      return {
        ...state,
        connection: {
          ...rest,
          accounts: accounts.map((item) => {
            const address = convertToSS58(item.address, state.network.ss58Prefix);
            keyring.saveAddress(address, item.meta);
            return {
              ...item,
              address,
            };
          }),
        },
      };
    }

    default:
      return state;
  }
}

export type ApiCtx = StoreState & {
  api: ApiPromise;
  chain: Chain;
  connectNetwork: (network: ChainConfig) => void;
  disconnect: () => void;
  setNetwork: (network: ChainConfig) => void;
  setApi: (api: ApiPromise) => void;
};

export const ApiContext = createContext<ApiCtx | null>(null);

let subscription: Subscription = EMPTY.subscribe();

export const ApiProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(accountReducer, initialState, (initValue) => {
    updateStorage({ activeNetwork: initValue.network });
    return { ...initValue };
  });
  const setNetwork = useCallback((payload: ChainConfig) => dispatch({ type: 'setNetwork', payload }), []);
  const setConnection = useCallback((payload: Connection) => dispatch({ type: 'setConnection', payload }), []);
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [chain, setChain] = useState<Chain>({ ss58Format: '', tokens: [] });

  const observer = useMemo(
    () => ({
      next: (connection: Connection) => {
        setConnection(connection);

        const nApi = (connection as PolkadotConnection).api;

        if (nApi) {
          nApi?.isReady.then(() => {
            setApi(nApi);
            setConnection({ ...connection, status: ConnectionStatus.complete });
          });
        }
      },
      error: (err: unknown) => {
        setConnection({ status: ConnectionStatus.error, accounts: [], type: 'unknown', api: null });
        console.error('%c connection error ', 'font-size:13px; background:pink; color:#bf2c9f;', err);
      },
      complete: () => {
        console.info('Connection life is over');
      },
    }),
    [setConnection]
  );

  const connectNetwork = useCallback(
    (config: ChainConfig) => {
      subscription.unsubscribe();

      setNetwork(config);
      subscription = getPolkadotConnection(config).subscribe(observer);
    },
    [observer, setNetwork]
  );

  // eslint-disable-next-line complexity
  const disconnect = useCallback(() => {
    subscription.unsubscribe();

    setConnection(initialConnection);
    setApi(null);
  }, [setConnection]);

  useEffect(() => {
    if (!state.network) {
      setConnection(initialConnection);
    } else {
      subscription = getPolkadotConnection(state.network).subscribe(observer);
    }

    return () => {
      console.info('[Api provider] Cancel network subscription of network', state.network?.name);
      subscription.unsubscribe();
    };
  }, [observer, setConnection, state.network]);

  useEffect(() => {
    if (!api) {
      return;
    }

    const sub$$ = from(api.rpc.system.properties()).subscribe((properties) => {
      const { ss58Format } = properties;

      setChain({
        ss58Format: ss58Format.isSome ? ss58Format.unwrap().toString() : '',
        tokens: extractTokens(properties),
      });
    });

    return () => sub$$.unsubscribe();
  }, [api]);

  if (!api || state.connection.status !== ConnectionStatus.complete) {
    return (
      <div
        className={`flex justify-center items-center w-screen h-screen relative ${
          readStorage().theme === THEME.DARK ? 'bg-black' : 'bg-white'
        }`}
      >
        <BallScalePulse />
        <Alert
          message={t('Api connecting')}
          description={t('Connecting to the remote node')}
          type="info"
          showIcon
          className="absolute top-4 right-4 max-w-2xl"
        />
      </div>
    );
  }

  return (
    <ApiContext.Provider
      value={{
        ...state,
        connectNetwork,
        disconnect,
        setNetwork,
        setApi,
        api,
        chain,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};
