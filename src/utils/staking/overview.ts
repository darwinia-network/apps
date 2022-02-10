import { DeriveStakingOverview } from '@polkadot/api-derive/staking/types';

export interface AccountWithClassifiedInfo {
  account: string;
  isElected: boolean;
  isFavorite: boolean;
}

interface ClassifiedStakingOverview {
  elected: AccountWithClassifiedInfo[];
  validators: AccountWithClassifiedInfo[];
  waiting: AccountWithClassifiedInfo[];
}

export function createClassifiedStakingOverview(
  stakingOverview: DeriveStakingOverview,
  favorites: string[],
  next?: string[]
): ClassifiedStakingOverview {
  const filterAccounts = (accounts: string[] = [], elected: string[], without: string[]) =>
    accounts
      .filter((accountId) => !without.includes(accountId))
      .map((account) => ({
        account,
        isElected: elected.includes(account),
        isFavorite: favorites.includes(account),
      }))
      .sort((a, b) => (a.isFavorite === b.isFavorite ? 0 : a.isFavorite ? -1 : 1));

  const allElected = stakingOverview.nextElected.map((item) => item.toString());
  const validatorIds = stakingOverview.validators.map((item) => item.toString());
  const validators = filterAccounts(validatorIds, allElected, []);
  const elected = filterAccounts(allElected, allElected, validatorIds);
  const waiting = filterAccounts(next, [], allElected);

  return {
    elected,
    validators,
    waiting,
  };
}
