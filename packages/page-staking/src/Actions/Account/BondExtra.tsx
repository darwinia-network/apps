// Copyright 2017-2020 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import React, { useState } from 'react';
import { InputAddress, InputBalance, Modal, TxButton } from '@polkadot/react-components';
import { Available, AvailableKton } from '@polkadot/react-query';

import { useTranslation } from '../../translate';
import ValidateAmount from './InputValidateAmount';

interface Props {
  onClose: () => void;
  stashId: string;
}

const ZERO = new BN(0);

function BondExtra ({ onClose, stashId }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [amountError, setAmountError] = useState<string | null>(null);
  const [maxAdditional, setMaxAdditional] = useState<BN | undefined>();
  const [maxBalance] = useState<BN | undefined>();

  return (
    <Modal
      className='staking--BondExtra'
      header= {t('Bond more funds')}
      size='large'
    >
      <Modal.Content className='ui--signer-Signer-Content'>
        <Modal.Columns>
          <Modal.Column>
            <InputAddress
              defaultValue={stashId}
              isDisabled
              label={t('stash account')}
            />
          </Modal.Column>
          <Modal.Column>
            <p>{t('Since this transaction deals with funding, the stash account will be used.')}</p>
          </Modal.Column>
        </Modal.Columns>
        <Modal.Columns>
          <Modal.Column>
            <InputBalance
              autoFocus
              help={t('Amount to add to the currently bonded funds. This is adjusted using the available funds on the account.')}
              isError={!!amountError || !maxAdditional || maxAdditional.eqn(0)}
              label={t('additional bonded funds')}
              labelExtra={
                <>
                  <Available
                    label={<span className='label'>{t('available')}</span>}
                    params={stashId}
                    withCurrency
                  />
                  <AvailableKton
                    label={<span className='label'>{t('available')}</span>}
                    params={stashId}
                    withCurrency
                  />
                </>
              }
              maxValue={maxBalance}
              onChange={setMaxAdditional}
            />
            <ValidateAmount
              accountId={stashId}
              onError={setAmountError}
              value={maxAdditional}
            />
          </Modal.Column>
          <Modal.Column>
            <p>{t('Ensure that not all funds are locked, funds need to be available for fees.')}</p>
          </Modal.Column>
        </Modal.Columns>
      </Modal.Content>
      <Modal.Actions onCancel={onClose}>
        <TxButton
          accountId={stashId}
          icon='sign-in'
          isDisabled={!maxAdditional?.gt(ZERO)}
          isPrimary
          label={t('Bond more')}
          onStart={onClose}
          params={[maxAdditional]}
          tx='staking.bondExtra'
        />
      </Modal.Actions>
    </Modal>
  );
}

export default React.memo(BondExtra);
