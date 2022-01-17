import { useState } from 'react';
import { useAccount, useApi } from '../../hooks';
import { AccountModal } from '../modal/Account';
import { Account } from './Account';
import { ConnectPolkadot } from './ConnectPolkadot';
import { EllipsisMiddle } from './EllipsisMiddle';

export function Connection() {
  const [isAccountDetailVisible, setIsAccountDetailVisible] = useState(false);
  const { account } = useAccount();
  const { connection } = useApi();

  return (
    <>
      {!!connection && !!account ? (
        <section className={`flex items-center gap-2 connection`}>
          {account && (
            <Account
              onClick={(event) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ((event.target as any).tagName === 'SPAN') {
                  setIsAccountDetailVisible(true);
                }
              }}
              className="max-w-xs text-white"
              logoStyle={{ background: 'white', height: 24, borderRadius: '50%' }}
            >
              <EllipsisMiddle className="overflow-hidden" percent={48.5}>
                {account}
              </EllipsisMiddle>
            </Account>
          )}
        </section>
      ) : (
        <ConnectPolkadot />
      )}

      <AccountModal isVisible={isAccountDetailVisible} cancel={() => setIsAccountDetailVisible(false)} />
    </>
  );
}
