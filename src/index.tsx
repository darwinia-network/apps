import '@darwinia/types';
import '@polkadot/api-augment';
import 'intro.js/introjs.css';
import { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { BallScalePulse } from './components/widget/BallScalePulse';
import { THEME } from './config';
import './index.scss';
import { AccountProvider, ApiProvider } from './providers';
import { TxProvider } from './providers/tx-provider';
import reportWebVitals from './reportWebVitals';
import './theme/antd/index.less';
import { readStorage } from './utils';

ReactDOM.render(
  <Suspense
    fallback={
      <div
        className={`flex justify-center items-center w-screen h-screen ${
          readStorage().theme === THEME.DARK ? 'bg-black' : 'bg-white'
        }`}
      >
        <BallScalePulse />
      </div>
    }
  >
    <BrowserRouter>
      <ApiProvider>
        <TxProvider>
          <AccountProvider>
            <App />
          </AccountProvider>
        </TxProvider>
      </ApiProvider>
    </BrowserRouter>
  </Suspense>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
