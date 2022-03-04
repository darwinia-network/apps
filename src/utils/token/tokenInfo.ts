import { AccountData } from '@darwinia/types';
import { ApiPromise } from '@polkadot/api';
import { waitUntilConnected } from '../network';

/**
 * @description other api can get balances:  api.derive.balances.all, api.query.system.account;
 * @see https://github.com/darwinia-network/wormhole-ui/issues/142
 */
export async function getDarwiniaBalances(api: ApiPromise, account = ''): Promise<[string, string]> {
  await waitUntilConnected(api);

  try {
    // type = 0 query ring balance.  type = 1 query kton balance.
    /* eslint-disable */
    const ringUsableBalance = await (api.rpc as any).balances.usableBalance(0, account);
    const ktonUsableBalance = await (api.rpc as any).balances.usableBalance(1, account);
    /* eslint-enable */

    return [ringUsableBalance.usableBalance.toString(), ktonUsableBalance.usableBalance.toString()];
  } catch (error: unknown) {
    console.warn(
      '%c [ Failed to  querying balance through rpc ]',
      'font-size:13px; background:pink; color:#bf2c9f;',
      (error as Record<string, string>).message
    );
  }

  try {
    const { data } = await api.query.system.account(account);
    const { free, freeKton } = data as unknown as AccountData;

    return [free.toString(), freeKton.toString()];
  } catch (error) {
    console.warn(
      '%c [ Failed to  querying balance through account info ]',
      'font-size:13px; background:pink; color:#bf2c9f;',
      (error as Record<string, string>).message
    );

    return ['0', '0'];
  }
}

// eslint-disable-next-line complexity
export const getTokenIconSrcBySymbol = (tokenSymbol = 'RING') => {
  switch (tokenSymbol) {
    case 'RING':
    case 'PRING':
    case 'ORING':
      return '/image/token-ring.svg';
    case 'KTON':
    case 'PKTON':
    case 'OKTON':
      return '/image/token-kton.svg';
    case 'CRAB':
      return '/image/token-crab.svg';
    case 'CKTON':
      return '/image/token-ckton.svg';
    default:
      return '/image/token-ring.svg';
  }
};
