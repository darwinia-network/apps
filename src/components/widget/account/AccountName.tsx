import { CheckCircleFilled, LinkOutlined, MinusCircleFilled, CheckOutlined } from '@ant-design/icons';
import { DeriveAccountRegistration } from '@polkadot/api-derive/accounts/types';
import { TypeRegistry } from '@polkadot/types/create';
import { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';
import { stringToU8a } from '@polkadot/util';
import { isFunction } from 'lodash';
import { ReactNode, useEffect, useState } from 'react';
import { from, of, delay } from 'rxjs';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useApi } from '../../../hooks';
import { CopyIcon } from '../../icons';
import { getAddressName } from '../../../utils';
import { SHORT_DURATION } from '../../../config';

interface AccountNameProps {
  account: string;
  copyable?: boolean;
  className?: string;
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
  index?: AccountIndex,
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
    <div className="inline-flex items-center w-full">
      {isSpecial && <CheckCircleFilled className="text-green-400" />}
      <span
        className={`inline-flex items-center opacity-60 overflow-hidden overflow-ellipsis  ${
          isLocal || isSpecial ? 'opacity-100' : isAddress ? '' : 'uppercase'
        }`}
      >
        {displayName}
      </span>
    </div>
  );
}

function createIdElem(
  nameElem: React.ReactNode,
  color: 'green' | 'red' | 'gray',
  icon: 'check' | 'minus' | 'link'
): React.ReactNode {
  return (
    <div className="flex items-center gap-2">
      {icon === 'check' && <CheckCircleFilled className={`text-${color}-400`} />}
      {icon === 'minus' && <MinusCircleFilled className={`text-${color}-400`} />}
      {icon === 'link' && <LinkOutlined className={`text-${color}-400`} />}
      {nameElem}
    </div>
  );
}

// eslint-disable-next-line complexity
function extractIdentity(address: string, identity: DeriveAccountRegistration): React.ReactNode {
  const judgements = identity.judgements.filter(([, judgement]) => !judgement.isFeePaid);
  const isGood = judgements.some(([, judgement]) => judgement.isKnownGood || judgement.isReasonable);
  const isBad = judgements.some(([, judgement]) => judgement.isErroneous || judgement.isLowQuality);
  const displayName = isGood ? identity.display : identity.display || ''; // at polkadot apps: .replace(/[^\x20-\x7E]/g, '');
  const displayParent =
    identity.displayParent && (isGood ? identity.displayParent : identity.displayParent.replace(/[^\x20-\x7E]/g, ''));
  const elem = createIdElem(
    <span
      className={`inline-flex items-center opacity-60 overflow-hidden overflow-ellipsis ${
        isGood && !isBad ? 'opacity-100' : ''
      }`}
    >
      <span>{displayParent || displayName}</span>
      {displayParent && <span>{`/${displayName || ''}`}</span>}
    </span>,
    isBad ? 'red' : isGood ? 'green' : 'gray',
    identity.parent ? 'link' : isGood && !isBad ? 'check' : 'minus'
  );

  displayCache.set(address, elem);

  return elem;
}

export const AccountName = ({ account, copyable, className }: AccountNameProps) => {
  const [name, setName] = useState<ReactNode>(() => extractName(account));
  const { api } = useApi();
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    // eslint-disable-next-line complexity
    const sub$$ = from(api.derive.accounts.info(account)).subscribe((data) => {
      const { accountId, accountIndex, identity, nickname } = data;
      const cacheAddr = (accountId || account || '').toString();

      if (identity?.parent) {
        parentCache.set(cacheAddr, identity.parent.toString());
      }

      if (isFunction(api.query.identity?.identityOf)) {
        const node = identity?.display ? extractIdentity(cacheAddr, identity) : extractName(cacheAddr, accountIndex);
        setName(node);
      } else if (nickname) {
        setName(nickname);
      } else {
        setName(defaultOrAddr(cacheAddr, accountIndex));
      }
    });

    return () => sub$$.unsubscribe();
  }, [account, api]);

  useEffect(() => {
    if (isCopied) {
      of(false).pipe(delay(SHORT_DURATION)).subscribe(setIsCopied);
    }
  }, [isCopied]);

  return (
    <span className={`inline-flex items-end ${className}`}>
      {name}
      {copyable && (
        <CopyToClipboard text={account} onCopy={() => setIsCopied(true)}>
          {isCopied ? <CheckOutlined className="text-sm ml-1" /> : <CopyIcon className="text-sm ml-px" />}
        </CopyToClipboard>
      )}
    </span>
  );
};
