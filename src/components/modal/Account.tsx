import BaseIdentityIcon from '@polkadot/react-identicon';
import { Card, Col, Modal, Row } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAccount, useApi } from '../../hooks';
import { IModalProps } from '../../model';
import { convertToSS58 } from '../../utils';
import { CloseIcon, CopyIcon, ViewBrowserIcon } from '../icons';
import { ActiveAccount } from '../widget/ActiveAccount';

const iconSize = 42;

export function AccountModal({ isVisible, cancel }: IModalProps) {
  const { account } = useAccount();
  const { network } = useApi();
  const { t } = useTranslation();

  return (
    <Modal
      title={t('Address')}
      visible={isVisible}
      footer={null}
      onCancel={cancel}
      destroyOnClose={true}
      bodyStyle={{ maxHeight: '80vh', overflow: 'hidden' }}
      closeIcon={<CloseIcon />}
    >
      <Card className="mb-4">
        <Row gutter={4} className="overflow-hidden">
          <Col span={4}>
            <BaseIdentityIcon
              theme="substrate"
              size={iconSize}
              className="mr-2 rounded-full border border-solid border-gray-100"
              value={account}
            />
          </Col>
          <Col span={20}>
            <Row>
              <Col>
                <span className="mr-4 text-gray-600 text-base">{account}</span>
                <ActiveAccount
                  isLargeRounded={false}
                  logoStyle={{ float: 'left', background: 'white', height: 24, borderRadius: '50%' }}
                  containerStyle={{ display: 'inline-block' }}
                  textClassName="text-xs h-4 leading-4  mr-0.5"
                />
              </Col>
            </Row>

            <Row className="my-2" gutter={8}>
              <Col className="flex items-center" style={{ cursor: 'default' }}>
                <CopyIcon className="mr-2" />
                <span className="text-xs text-gray-600">{t('Copy address')}</span>
              </Col>

              <Col className="flex items-center cursor-pointer">
                <ViewBrowserIcon className="mr-2 text-xl" />
                <span
                  onClick={() => {
                    const address = convertToSS58(account ?? '', network.ss58Prefix);

                    window.open(`https://${network}.subscan.io/account/${address}`, 'blank');
                  }}
                  className="text-xs text-gray-600"
                >
                  {t('View in Subscan')}
                </span>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
    </Modal>
  );
}
