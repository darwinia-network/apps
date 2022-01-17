import { useEffect, useState } from 'react';
import { useAccount, useApi } from '../../hooks';
import { AccountModal } from '../modal/Account';
import { AccountSelectModal } from '../modal/AccountSelect';
import { Account } from './Account';
import { ConnectPolkadot } from './ConnectPolkadot';
import { EllipsisMiddle } from './EllipsisMiddle';

export function Connection() {
  const [isAccountSwitcherVisible, setIsAccountSwitcherVisible] = useState(false);
  const [isAccountDetailVisible, setIsAccountDetailVisible] = useState(false);
  const { account, setAccount } = useAccount();
  const { connection } = useApi();

  useEffect(() => {
    // const { accounts } = connection;
    // setAccount(accounts[0]?.address);
  }, [connection, setAccount]);

  return (
    <>
      {!!connection && !!account ? (
        <section className="flex items-center gap-2">
          {account && (
            <Account
              onClick={() => {
                setIsAccountDetailVisible(true);
              }}
            >
              <EllipsisMiddle>{account}</EllipsisMiddle>
              {/* <ShortAccount
                account={account}
                className="self-stretch sm:px-1 bg-white sm:my-px sm:mx-px sm:rounded-xl text-gray-800"
              /> */}
            </Account>
          )}
        </section>
      ) : (
        <ConnectPolkadot />
      )}

      <AccountSelectModal
        account={account ?? undefined}
        isVisible={isAccountSwitcherVisible}
        confirm={setAccount}
        cancel={() => setIsAccountSwitcherVisible(false)}
      />

      <AccountModal isVisible={isAccountDetailVisible} cancel={() => setIsAccountDetailVisible(false)} />
    </>
  );
}
