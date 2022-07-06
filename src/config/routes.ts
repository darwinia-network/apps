import { RouteProps } from 'react-router-dom';

import { Account } from '../pages/Account';
import { Migration } from '../pages/Migration';
import { Portal } from '../pages/Portal';
import { Staking } from '../pages/Staking';
import { Toolbox } from '../pages/Toolbox';
import { FeeMarket } from '../pages/FeeMarket';
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

export const routes: RouteProps[] = [
  {
    caseSensitive: true,
    path: Path.root,
    children: Account,
  },
  {
    caseSensitive: true,
    path: Path.account,
    children: Account,
  },
  {
    caseSensitive: true,
    path: Path.staking,
    children: Staking,
  },
  {
    caseSensitive: true,
    path: Path.toolbox,
    children: Toolbox,
  },
  {
    caseSensitive: true,
    path: Path.portal,
    children: Portal,
  },
  {
    caseSensitive: true,
    path: Path.migration,
    children: Migration,
  },
  {
    caseSensitive: true,
    path: Path.feemarket,
    children: FeeMarket,
  },
  {
    path: '*',
    children: Page404,
  },
];
