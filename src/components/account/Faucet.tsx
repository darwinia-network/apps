import { Button, Typography, Modal, Space, Spin, notification } from 'antd';
import { useCallback, useState, PropsWithChildren, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'lodash';
import { timer } from 'rxjs';
import { millisecondsInHour, millisecondsInSecond } from 'date-fns';
import { useNavigate } from 'react-router-dom';

import { rxGet, rxPost, formatTimeLeft } from '../../utils';
import { useAccount } from '../../hooks';
import { SubscanLink } from '../widget/SubscanLink';
import {
  Network,
  FaucetResponse,
  FaucetResponseCode,
  FaucetThrottleData,
  FaucetTransferData,
  SearchParamsKey,
  SearchParamsOpen,
} from '../../model';

const Section = ({ label, children, className }: PropsWithChildren<{ label: string; className?: string }>) => (
  <div className={className}>
    <Typography.Paragraph className="font-semibold">{label}</Typography.Paragraph>
    <div className="px-4">{children}</div>
  </div>
);

const Confirm = ({ loading, onClick = () => undefined }: { loading: boolean; onClick?: () => void }) => {
  const { t } = useTranslation();
  return (
    <Button size="large" className="w-11/12" loading={loading} onClick={onClick}>
      {t('Confirm')}
    </Button>
  );
};

const ThrottleLimit = ({
  throttleData: { throttleHours, lastTime },
  onFinish,
}: {
  throttleData: FaucetThrottleData;
  onFinish: () => void;
}) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState({ hrs: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const sub$$ = timer(0, millisecondsInSecond).subscribe(() => {
      const milliSecs = throttleHours * millisecondsInHour + lastTime - Date.now();

      if (milliSecs > 0) {
        const { hours: hrs, minutes: mins, seconds: secs } = formatTimeLeft(milliSecs);
        setTimeLeft({ hrs, mins, secs });
      } else {
        onFinish();
      }
    });

    return () => sub$$.unsubscribe();
  }, [lastTime, throttleHours, onFinish]);

  return (
    <>
      <Typography.Text className="text-red-500">{t('Time left until the next request')}</Typography.Text>
      <Typography.Text className="text-2xl">{`${timeLeft.hrs} hrs ${timeLeft.mins} mins ${timeLeft.secs} secs`}</Typography.Text>
    </>
  );
};

const Insufficient = () => {
  const { t } = useTranslation();
  return (
    <>
      <Typography.Text className="text-red-500">{t('Sorry that the faucet is lack of tokens')}</Typography.Text>
      <Typography.Text>
        {t('Please contact us via ')}
        <Typography.Link href="mailto:hello@darwinia.network">hello@darwinia.network</Typography.Link>
      </Typography.Text>
    </>
  );
};

// eslint-disable-next-line complexity
const FaucetWithAddress = ({ network, address, symbol }: { network: Network; address: string; symbol: string }) => {
  const { refreshAssets } = useAccount();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [loading, setLoaing] = useState(false);
  const [visible, setVisible] = useState(false);

  const [message, setMessage] = useState('');
  const [throttle, setThrottle] = useState<FaucetThrottleData>({ lastTime: 0, throttleHours: 0 });
  const [status, setStatus] = useState<FaucetResponseCode | null>(null);

  const handleShowFaucet = useCallback(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    urlSearchParams.set(SearchParamsKey.OPEN, SearchParamsOpen.FAUCET);
    navigate(`?${urlSearchParams.toString()}`);
    setVisible(true);
  }, [navigate]);

  const handleHideFaucet = useCallback(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    urlSearchParams.delete(SearchParamsKey.OPEN);
    navigate(`?${urlSearchParams.toString()}`);
    setVisible(false);
  }, [navigate]);

  const handleOpenFaucet = useCallback(() => {
    setBusy(true);
    rxPost<FaucetResponse<unknown>>({
      url: `/api/${network}`,
      params: { address },
    }).subscribe({
      next: (res) => {
        if (!res) {
          return;
        }

        const { code, message, data } = res;
        if (code === FaucetResponseCode.SUCCESS_TRANSFER) {
          const { txHash, lastTime, throttleHours } = data as FaucetTransferData & FaucetThrottleData;
          notification.success({
            message: t('Faucet success'),
            description: <SubscanLink network={network} txHash={txHash} className="underline" />,
          });

          refreshAssets();
          setThrottle({ lastTime, throttleHours });
          setVisible(false);
        } else if (code === FaucetResponseCode.FAILED_EXTRINSIC) {
          notification.warning({
            message,
            description: (
              <SubscanLink network={network} txHash={(data as FaucetTransferData).txHash} className="underline" />
            ),
          });
          setVisible(false);
        } else if (code === FaucetResponseCode.FAILED_THROTTLE) {
          setThrottle(data as FaucetThrottleData);
        }

        setMessage(message);
        setStatus(code);
        setBusy(false);
      },
      error: (err) => {
        const error = err as Error;
        notification.error({
          message: t('Faucet error'),
          description: error.message,
        });
        setBusy(false);
      },
    });
  }, [network, address, t, refreshAssets]);

  useEffect(() => {
    setLoaing(true);
    const sub$$ = rxGet<FaucetResponse<unknown>>({
      url: `/api/${network}`,
      params: { address },
    }).subscribe({
      next: (res) => {
        if (!res) {
          return;
        }

        const { code, message, data } = res;
        if (code === FaucetResponseCode.FAILED_THROTTLE) {
          setThrottle(data as FaucetThrottleData);
        }
        setMessage(message);
        setStatus(code);
        setLoaing(false);
      },
      error: (err) => {
        const error = err as Error;
        notification.error({
          message: error.message,
        });
        setLoaing(false);
      },
    });

    return () => {
      sub$$.unsubscribe();
      setLoaing(false);
    };
  }, [network, address]);

  useEffect(() => {
    setStatus(null); // reset status
  }, [network, symbol, address]);

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    if (urlSearchParams.get(SearchParamsKey.OPEN) === SearchParamsOpen.FAUCET) {
      setVisible(true);
    }
  }, []);

  return (
    <>
      <Button onClick={handleShowFaucet} type="text" loading={busy}>
        <Typography.Text className={`text-${network}-main`}>{t('Faucet')}</Typography.Text>
      </Button>

      <Modal
        title={t('Faucet')}
        visible={visible}
        footer={
          busy ? null : (
            <div className="flex flex-col items-center">
              {!status || status === FaucetResponseCode.SUCCESS_PRECHECK ? (
                <Confirm onClick={handleOpenFaucet} loading={loading || busy} />
              ) : status === FaucetResponseCode.FAILED_THROTTLE || status === FaucetResponseCode.SUCCESS_TRANSFER ? (
                <ThrottleLimit throttleData={throttle} onFinish={() => setStatus(null)} />
              ) : status === FaucetResponseCode.FAILED_INSUFFICIENT ? (
                <Insufficient />
              ) : (
                <Typography.Text className="text-red-500">{message}</Typography.Text>
              )}
            </div>
          )
        }
        width={420}
        onCancel={handleHideFaucet}
      >
        {busy ? (
          <div className="py-8 flex flex-col justify-center items-center">
            <Spin size="large" />
            <Typography.Paragraph className="mt-4">{t('Transaction is being processed')}</Typography.Paragraph>
          </div>
        ) : (
          <Space direction="vertical">
            <Section label={t('You will receive')}>
              <div className="py-6 flex justify-center items-center bg-gray-100 rounded-xl">
                <Typography.Text className="text-xl" style={{ textShadow: '0 0.2rem #D9D9D9' }}>
                  100 {symbol}
                </Typography.Text>
              </div>
            </Section>
            <Section label={t('What is faucet')} className="mt-6">
              <Typography.Paragraph>
                {t(
                  'This faucet sends {{symbol}} (TestToken) on {{network}} Chain to your account. You can request 100 {{symbol}} from faucet every 12h.',
                  { network: capitalize(network), symbol }
                )}
              </Typography.Paragraph>
            </Section>
          </Space>
        )}
      </Modal>
    </>
  );
};

const FaucetWithOutAddress = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(true);

  return (
    <Modal
      title={t('Faucet')}
      visible={visible}
      width={420}
      onCancel={() => setVisible(false)}
      footer={
        <div className="flex justify-center">
          <Button size="large" className="w-11/12" onClick={() => setVisible(false)}>
            {t('Ok')}
          </Button>
        </div>
      }
    >
      <Typography.Text>{t('Please select an account first.')}</Typography.Text>
    </Modal>
  );
};

export const Faucet = ({ network, address, symbol }: { network: Network; address?: string; symbol: string }) =>
  address ? <FaucetWithAddress network={network} address={address} symbol={symbol} /> : <FaucetWithOutAddress />;
