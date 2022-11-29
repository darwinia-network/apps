import { Form, Card, Button } from 'antd';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { from, Observable, Subscriber } from 'rxjs';
import { useAccount, useRecordsQuery } from '../../../hooks';
import { useMetamask } from '../../../hooks/ metamask';
import { DepositItem } from '../../widget/form-control/DepositItem';
import {
  validateMessages,
  ETHEREUM_CLAIM_DEPOSIT,
  ethereumConfig,
  EvoApiPath,
  EVOLUTION_DOMAIN,
} from '../../../config';
import i18n from '../../../config/i18n';
import { abi } from '../../../config/abi';
import { apiUrl } from '../../../utils';
import { entrance } from '../../../utils/network';
import { Deposit, DepositResponse } from '../../../model';
import { ClaimHistory } from './history';

type DepositForm = {
  deposit: Deposit;
};

export const Deposits = () => {
  const { account } = useAccount();
  const {
    connection: { status, accounts },
    connectNetwork,
    disconnect,
  } = useMetamask();
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  const activeAccount = useMemo(() => accounts[0]?.address, [accounts]);

  const response = useRecordsQuery<DepositResponse>({
    url: apiUrl(EVOLUTION_DOMAIN.product, EvoApiPath.deposit),
    params: { owner: activeAccount, 'EVO-NETWORK': 'Eth' },
  });
  const { refetch } = response;

  useEffect(() => {
    if (refetch && activeAccount) {
      refetch({
        url: apiUrl(EVOLUTION_DOMAIN.product, EvoApiPath.deposit),
        params: { owner: activeAccount, 'EVO-NETWORK': 'Eth' },
      });
    }
  }, [refetch, activeAccount]);

  const recipient = useMemo(() => account?.displayAddress || '', [account]);
  const disableConnect = useMemo(() => status !== 'success' && status !== 'pending', [status]);

  const handleClaim = useCallback(
    ({ deposit }: DepositForm) => {
      const obs = new Observable((subscriber: Subscriber<boolean>) => {
        try {
          subscriber.next(true);

          const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);
          const contract = new web3.eth.Contract(abi.bankABI, ETHEREUM_CLAIM_DEPOSIT);

          contract.methods
            .claimDeposit(deposit.deposit_id)
            .send({ from: activeAccount })
            .on('receipt', () => {
              subscriber.next(false);
              subscriber.complete();
            })
            .catch((error: { code: number; message: string }) => {
              subscriber.error(error);
            });
        } catch (error) {
          console.error(error);
          subscriber.error(error);
        }
      });

      from(obs).subscribe({
        next: setBusy,
        error: () => setBusy(false),
      });
    },
    [activeAccount]
  );

  return (
    <Card className="max-w-max">
      <div className="mt-8 mb-4 flex items-center gap-4">
        {activeAccount ? (
          <>
            <span className="text-lg mr-2">{t('Metamask account')}:</span>
            <span>{activeAccount}</span>
          </>
        ) : (
          <span className="text-lg mr-2">{t('Connect to Metamask')}:</span>
        )}

        {status === 'success' && (
          <Button type="default" onClick={() => disconnect()} disabled={disableConnect}>
            {t('Disconnect')}
          </Button>
        )}

        {status === 'pending' && (
          <Button type="primary" onClick={() => connectNetwork(ethereumConfig)} disabled={disableConnect}>
            {t('Connect to Metamask')}
          </Button>
        )}
      </div>

      <div className="max-w-xl lg:w-144 mb-8">
        <span className="text-sm font-normal text-gray-500">
          {t('You can check your term deposit of RING on Ethereum and claim the expired ones by connecting MetaMask.')}
        </span>
      </div>

      <Form<DepositForm>
        layout="vertical"
        initialValues={{
          recipient,
        }}
        className="max-w-xl lg:w-144"
        validateMessages={validateMessages[i18n.language as 'en' | 'zh-CN' | 'zh']}
        onFinish={handleClaim}
      >
        <DepositItem label="Deposit list" name="deposit" response={response} />
        <Form.Item>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            loading={busy}
            disabled={!activeAccount || !response.data?.list.length}
            className="flex items-center justify-center w-28"
          >
            {t('Claim')}
          </Button>
        </Form.Item>
      </Form>

      <ClaimHistory response={response} />
    </Card>
  );
};
