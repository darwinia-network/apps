import { useControllerAccount } from './controllerAccount';
import { useStashAccount } from './stashAccount';

export const useControllerAndStashAccount = (account?: string | null) => {
  const { controllerAccount, refreshControllerAccount } = useControllerAccount(account);
  const { stashAccount, refreshStashAccount } = useStashAccount(controllerAccount);

  return { controllerAccount, stashAccount, refreshControllerAccount, refreshStashAccount };
};
