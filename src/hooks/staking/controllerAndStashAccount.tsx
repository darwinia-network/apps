import { useControllerAccount } from './controllerAccount';
import { useStashAccount } from './stashAccount';

export const useControllerAndStashAccount = (account?: string | null) => {
  const { controllerAccount, refreshControllerAccount } = useControllerAccount(account);
  const { stashAccount } = useStashAccount(controllerAccount);

  return { controllerAccount, stashAccount, refreshControllerAndStashAccount: refreshControllerAccount };
};
