// Copyright 2017-2020 @polkadot/ui-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiProps } from '@polkadot/react-api/types';
import { I18nProps } from '@polkadot/react-components/types';

import React from 'react';
import { Icon, InputAddress, Modal, TxButton, TxComponent } from '@polkadot/react-components';
import { withApi, withMulti } from '@polkadot/react-api/hoc';

import translate from '../../translate';
import detectUnsafe from '../../unsafeChains';
import InputValidationController from '../Account/InputValidationController';

interface Props extends ApiProps, I18nProps {
  defaultControllerId: string;
  isValidating?: boolean;
  onClose: () => void;
  stashId: string;
}

interface State {
  controllerError: string | null;
  controllerId: string | null;
}

class SetControllerAccount extends TxComponent<Props, State> {
  constructor (props: Props) {
    super(props);

    this.state = {
      controllerError: null,
      controllerId: null
    };
  }

  public render (): React.ReactNode {
    const { defaultControllerId, isValidating, onClose, stashId, systemChain, t } = this.props;
    const { controllerError, controllerId } = this.state;
    // const isUnsafeChain = detectUnsafe(systemChain);
    const isUnsafeChain = true;
    const canSubmit = isUnsafeChain || (!controllerError && !!controllerId && (defaultControllerId !== controllerId));

    return (
      <Modal
        className='staking--SetControllerAccount'
        header={t('Change controller account')}
        onCancel={onClose}
        size='small'
      >
        <Modal.Content className='ui--signer-Signer-Content'>
          {isValidating && (
            <article className='warning'>
              <div className='warning'>
                <Icon name='warning sign' />
                {t('Warning - Changing the controller while validating will modify the associated session account. It is advised to stop validating before changing the controller account.')}
              </div>
            </article>
          )}
          <InputAddress
            className='medium'
            isDisabled
            label={t('stash account')}
            value={stashId}
          />
          <InputAddress
            className='medium'
            defaultValue={defaultControllerId}
            help={t('The controller is the account that will be used to control any nominating or validating actions. Should not match another stash or controller.')}
            isError={!isUnsafeChain && !!controllerError}
            label={t('controller account')}
            onChange={this.onChangeController}
            type='account'
            value={controllerId}
          />
          <InputValidationController
            accountId={stashId}
            controllerId={controllerId}
            defaultController={defaultControllerId}
            isUnsafeChain={isUnsafeChain}
            onError={this.onControllerError}
          />
        </Modal.Content>
        <Modal.Actions onCancel={onClose}>
          <TxButton
            accountId={stashId}
            icon='sign-in'
            isDisabled={!canSubmit}
            isPrimary
            label={t('Set controller')}
            onStart={onClose}
            params={[controllerId]}
            tx='staking.setController'
            withSpinner
          />
        </Modal.Actions>
      </Modal>
    );
  }

  private onChangeController = (controllerId: string | null): void => {
    this.setState({ controllerId });
  }

  private onControllerError = (controllerError: string | null): void => {
    this.setState({ controllerError });
  }
}

export default withMulti(
  SetControllerAccount,
  translate,
  withApi
);
