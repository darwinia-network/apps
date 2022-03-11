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
    <div className={`w-full flex border-gray-100 dark:border-gray-700 ${className}`}>
      <div
        className={`gap-4 w-full flex justify-between items-center lg:flex-col lg:justify-start lg:items-start lg:w-max`}
      >
        <h3 className="font-medium text-base text-black opacity-80">{t(title)}</h3>
        <div className={`text-2xl font-medium whitespace-nowrap text-${network.name}-main`}>{value}</div>
      </div>
    </div>
  );
}
