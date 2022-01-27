import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useStaking } from '../../../hooks';
import { StakingActionProps } from './interface';

export function SetValidator({ type = 'text' }: StakingActionProps) {
  const { t } = useTranslation();
  const { isControllerAccountOwner } = useStaking();
  const { isValidating } = useStaking();

  return isValidating ? (
    <Button disabled={!isControllerAccountOwner} type={type}>
      {t('Change validator preferences')}
    </Button>
  ) : null;
}
