import { RouteProps } from 'react-router-dom';

import { Account } from '../pages/Account';
import { Migration } from '../pages/Migration';
import { Portal } from '../pages/Portal';
import { Staking } from '../pages/Staking';
import { Toolbox } from '../pages/Toolbox';
// import { FeeMarket } from '../pages/FeeMarket';
import { Page404 } from '../components/widget/Page404';

export enum Path {
  root = '/',
  account = '/account',
  staking = '/staking',
  toolbox = '/toolbox',
  portal = '/portal',
  migration = '/migration',
  feemarket = '/feemarket',
}

export const routes: (RouteProps & { PageComponent: React.ComponentType })[] = [
  {
    path: Path.root,
    PageComponent: Account,
  },
  {
    path: Path.account,
    PageComponent: Account,
  },
  {
    path: Path.staking,
    PageComponent: Staking,
  },
  {
    path: Path.toolbox,
    PageComponent: Toolbox,
  },
  {
    path: Path.portal,
    PageComponent: Portal,
  },
  {
    path: Path.migration,
    PageComponent: Migration,
  },
  // {
  //   path: Path.feemarket,
  //   PageComponent: FeeMarket,
  // },
  {
    path: '*',
    PageComponent: Page404,
  },
];
