import { DeriveAccountRegistration } from '@polkadot/api-derive/accounts/types';
import { TypeRegistry } from '@polkadot/types/create';
import { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';
import { stringToU8a } from '@polkadot/util';
import { Badge } from 'antd';
import { isFunction } from 'lodash';
import { ReactNode, useEffect, useState } from 'react';
import { from } from 'rxjs';
import { useApi } from '../../hooks';
import { getAddressName } from '../../utils';

interface AccountNameProps {
  account: string;
}

const registry = new TypeRegistry();
const PAD = 32;
const KNOWN: [AccountId, string][] = [
  [registry.createType('AccountId', stringToU8a('modlpy/socie'.padEnd(PAD, '\0'))), 'Society'],
  [registry.createType('AccountId', stringToU8a('modlpy/trsry'.padEnd(PAD, '\0'))), 'Treasury'],
];
const displayCache = new Map<string, React.ReactNode>();
const indexCache = new Map<string, string>();
const parentCache = new Map<string, string>();

export function getParentAccount(value: string): string | undefined {
  return parentCache.get(value);
}

// eslint-disable-next-line complexity
function defaultOrAddr(
  address: AccountId | AccountIndex | Address | string | Uint8Array,
  index: AccountIndex | string = '',
  defaultName = ''
): [React.ReactNode, boolean, boolean, boolean] {
  const known = KNOWN.find(([addr]) => addr.eq(address));

  if (known) {
    return [known[1], false, false, true];
  }

  const accountId = address.toString();

  if (!accountId) {
    return [defaultName, false, false, false];
  }

  const [isAddressExtracted, , extracted] = getAddressName(accountId, null, defaultName);
  const accountIndex = (index || '').toString() || indexCache.get(accountId);

  if (isAddressExtracted && accountIndex) {
    indexCache.set(accountId, accountIndex);

    return [accountIndex, false, true, false];
  }

  return [extracted, !isAddressExtracted, isAddressExtracted, false];
}

// eslint-disable-next-line complexity
function extractName(address: string, accountIndex?: AccountIndex): React.ReactNode {
  const displayCached = displayCache.get(address);

  if (displayCached) {
    return displayCached;
  }

  const [displayName, isLocal, isAddress, isSpecial] = defaultOrAddr(address, accountIndex);

  return (
    <div className="via-identity">
      {isSpecial && (
        <Badge
          color="green"
          // icon='archway'
          //   isSmall
        />
      )}
      <span className={`name${isLocal || isSpecial ? ' isLocal' : isAddress ? ' isAddress' : ''}`}>{displayName}</span>
    </div>
  );
}

function createIdElem(nameElem: React.ReactNode, color: 'green' | 'red' | 'gray'): React.ReactNode {
  return (
    <div className="via-identity">
      <Badge
        color={color}
        //       icon={icon}
        // isSmall
      />
      {nameElem}
    </div>
  );
}

// eslint-disable-next-line complexity
function extractIdentity(address: string, identity: DeriveAccountRegistration): React.ReactNode {
  const judgements = identity.judgements.filter(([, judgement]) => !judgement.isFeePaid);
  const isGood = judgements.some(([, judgement]) => judgement.isKnownGood || judgement.isReasonable);
  const isBad = judgements.some(([, judgement]) => judgement.isErroneous || judgement.isLowQuality);
  const displayName = isGood ? identity.display : (identity.display || '').replace(/[^\x20-\x7E]/g, '');
  const displayParent =
    identity.displayParent && (isGood ? identity.displayParent : identity.displayParent.replace(/[^\x20-\x7E]/g, ''));
  const elem = createIdElem(
    <span className={`name${isGood && !isBad ? ' isGood' : ''}`}>
      <span className="top">{displayParent || displayName}</span>
      {displayParent && <span className="sub">{`/${displayName || ''}`}</span>}
    </span>,
    isBad ? 'red' : isGood ? 'green' : 'gray'
    //     identity.parent ? 'link' : isGood && !isBad ? 'check' : 'minus'
  );

  displayCache.set(address, elem);

  return elem;
}

export function AccountName({ account }: AccountNameProps) {
  const [name, setName] = useState<ReactNode>(account);
  const { api } = useApi();

  useEffect(() => {
    // eslint-disable-next-line complexity
    const sub$$ = from(api.derive.accounts.info(account)).subscribe((data) => {
      const { accountId, accountIndex, identity, nickname } = data;
      const cacheAddr = (accountId || account || '').toString();

      if (identity?.parent) {
        parentCache.set(cacheAddr, identity.parent.toString());
      }

      if (isFunction(api.query.identity?.identityOf)) {
        setName(() =>
          identity?.display ? extractIdentity(cacheAddr, identity) : extractName(cacheAddr, accountIndex)
        );
      } else if (nickname) {
        setName(nickname);
      } else {
        setName(defaultOrAddr(cacheAddr, accountIndex));
      }

      console.log('%c [ res ]-17', 'font-size:13px; background:pink; color:#bf2c9f;', data);
    });

    return () => sub$$.unsubscribe();
  }, [account, api]);

  return <span>{name}</span>;
}
