import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useStaking } from '../../../hooks';
import { StakingActionProps } from './interface';

export function Nominate({ label, type = 'text' }: StakingActionProps) {
  const { t } = useTranslation();
  const { isControllerAccountOwner, isNominating } = useStaking();

  return isNominating ? (
    <Button type={type} disabled={!isControllerAccountOwner}>
      {t(label ?? 'Nominate')}
    </Button>
  ) : null;
}
