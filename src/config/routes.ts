import { RouteProps } from 'react-router-dom';
import { Page404 } from '../components/widget/Page404';
import { Home } from '../pages/Home';

export enum Path {
  root = '/',
  history = '/history',
  airdrop = '/airdrop',
  airdropHistory = '/airdropHistory',
  register = '/register',
  configure = '/configure',
}

export const routes: RouteProps[] = [
  {
    exact: true,
    path: Path.root,
    children: Home,
  },
  {
    path: '*',
    children: Page404,
  },
];
