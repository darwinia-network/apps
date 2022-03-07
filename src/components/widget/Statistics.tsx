import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../hooks';

export function Statistics({
  title,
  value,
  className,
}: {
  title: string;
  value: string | number | ReactElement;
  className?: string;
}) {
  const { network } = useApi();
  const { t } = useTranslation();

  return (
    <div
      className={`flex lg:flex-col justify-between items-center lg:justify-start lg:items-start gap-4 w-full lg:w-2/3 relative lg:border-r border-gray-100 dark:border-gray-700 ${className}`}
    >
      <h3 className="font-medium text-base text-black opacity-80">{t(title)}</h3>
      <div className={`text-2xl font-medium whitespace-nowrap text-${network.name}-main`}>{value}</div>
    </div>
  );
}
