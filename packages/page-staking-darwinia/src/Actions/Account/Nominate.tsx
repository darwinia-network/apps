// Copyright 2017-2020 @polkadot/ui-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DeriveStakingOverview } from '@polkadot/api-derive/types';
import { InputAddress, InputAddressMulti, Modal, TxButton } from '@polkadot/react-components';
import { useFavorites } from '@polkadot/react-hooks';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { STORE_FAVS_BASE } from '../../constants';
import { useTranslation } from '../../translate';



interface Props {
  className?: string;
  controllerId: string;
  next: string[];
  nominees?: string[];
  onClose: () => void;
  stakingOverview?: DeriveStakingOverview;
  stashId: string;
}

const MAX_NOMINEES = 16;

function Nominate ({ className, controllerId, nominees, onClose, next, stakingOverview, stashId }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();
  const [favorites] = useFavorites(STORE_FAVS_BASE);
  const [validators, setValidators] = useState<string[]>([]);
  const [selection, setSelection] = useState<string[] | undefined>();
  const [available, setAvailable] = useState<string[]>([]);

  useEffect((): void => {
    if (!selection && nominees) {
      setSelection(nominees);
    }
  }, [selection, nominees]);

  useEffect((): void => {
    if (stakingOverview) {
      setValidators(stakingOverview.validators.map((acc): string => acc.toString()));
    }
  }, [stakingOverview]);

  useEffect((): void => {
    const shortlist = [
      // ensure that the favorite is included in the list of stashes
      ...favorites.filter((acc): boolean => validators.includes(acc) || next.includes(acc)),
      // make sure the nominee is not in our favorites already
      ...(nominees || []).filter((acc): boolean => !favorites.includes(acc))
    ];

    setAvailable([
      ...shortlist,
      ...validators.filter((acc): boolean => !shortlist.includes(acc)),
      ...next.filter((acc): boolean => !shortlist.includes(acc))
    ]);
  }, [favorites, next, nominees, validators]);

  return (
    <Modal
      className={`staking--Nominating ${className}`}
      header={t('Nominate Validators')}
      onCancel={onClose}
    >
      <Modal.Content className='ui--signer-Signer-Content'>
        <InputAddress
          className='medium'
          defaultValue={controllerId}
          isDisabled
          label={t('controller account')}
        />
        <InputAddress
          className='medium'
          defaultValue={stashId}
          isDisabled
          label={t('stash account')}
        />
        <InputAddressMulti
          available={available}
          className='medium'
          help={t('Filter available candidates based on name, address or short account index.')}
          label={t('filter candidates')}
          maxCount={MAX_NOMINEES}
          onChange={setSelection}
          // Theoretically, should use defaultValue here.
          value={selection || []} // 
        />
      </Modal.Content>
      <Modal.Actions onCancel={onClose}>
        <TxButton
          accountId={controllerId}
          isDisabled={!selection?.length}
          isPrimary
          onStart={onClose}
          params={[selection]}
          label={t('Nominate')}
          icon='hand paper outline'
          tx='staking.nominate'
        />
      </Modal.Actions>
    </Modal>
  );
}

export default styled(Nominate)`
  .shortlist {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    .candidate {
      border: 1px solid #eee;
      border-radius: 0.25rem;
      margin: 0.25rem;
      padding-bottom: 0.25rem;
      padding-right: 0.5rem;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        border-color: transparent;
        border-style: solid;
        border-radius: 0.25em;
        border-width: 0.25em;
      }

      &.isAye {
        background: #fff;
        border-color: #ccc;
      }

      &.member::after {
        border-color: green;
      }

      &.runnerup::after {
        border-color: steelblue;
      }

      .ui--AddressMini-icon {
        z-index: 1;
      }

      .candidate-right {
        text-align: right;
      }
    }
  }
`;
