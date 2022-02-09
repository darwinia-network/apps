import { RightCircleOutlined } from '@ant-design/icons';
import { useApi } from '../../../hooks';
import { IconProps } from '../../icons/icon-factory';

interface MaxBadgeProps extends IconProps {
  nominatorCount: number;
}

export function MaxBadge({ nominatorCount, className }: MaxBadgeProps) {
  const { api } = useApi();

  const max = api.consts.staking.maxNominatorRewardedPerValidator;

  if (!nominatorCount || !max || max.gten(nominatorCount)) {
    return null;
  }

  return <RightCircleOutlined className={`text-red-400 ${className}`} />;
}
