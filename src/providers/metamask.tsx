import { createContext, useCallback, useMemo, useReducer } from 'react';
import { EMPTY, Subscription } from 'rxjs';
import { Action, Connection, ConnectionStatus, AddEthereumChainParameter } from '../model';
import { connectToEth } from '../utils';

interface StoreState {
  connection: Connection;
}

type ActionType = 'setNetwork' | 'setConnection' | 'setEnableTestNetworks';

const initialConnection: Connection = {
  status: ConnectionStatus.pending,
  type: 'unknown',
  accounts: [],
  chainId: '',
};

const initialState: StoreState = {
  connection: initialConnection,
};

// eslint-disable-next-line complexity, @typescript-eslint/no-explicit-any
function accountReducer(state: StoreState, action: Action<ActionType, any>): StoreState {
  switch (action.type) {
    case 'setConnection': {
      return { ...state, connection: action.payload };
    }

    default:
      return state;
  }
}

export type MetamaskCtx = StoreState & {
  connectNetwork: (network: AddEthereumChainParameter) => void;
  disconnect: () => void;
};

export const MetamaskContext = createContext<MetamaskCtx | null>(null);

let subscription: Subscription = EMPTY.subscribe();

export const MetamaskProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const [state, dispatch] = useReducer(accountReducer, initialState);
  const setConnection = useCallback((payload: Connection) => dispatch({ type: 'setConnection', payload }), []);
  const observer = useMemo(
    () => ({
      next: (connection: Connection) => {
        setConnection(connection);
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
    (config: AddEthereumChainParameter) => {
      subscription.unsubscribe();

      subscription = connectToEth(config).subscribe(observer);
    },
    [observer]
  );

  const disconnect = useCallback(() => {
    if (window.ethereum.isConnected()) {
      setConnection(initialConnection);
      return;
    }
  }, [setConnection]);

  return (
    <MetamaskContext.Provider
      value={{
        ...state,
        connectNetwork,
        disconnect,
      }}
    >
      {children}
    </MetamaskContext.Provider>
  );
};
