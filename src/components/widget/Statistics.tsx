import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

export function Statistics({
  title,
  value,
  className,
}: {
  title: string;
  value: string | number | ReactElement;
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <div
      className={`flex lg:flex-col justify-between items-center lg:justify-start lg:items-start gap-4 w-full lg:w-2/3 relative lg:border-r border-gray-100 dark:border-gray-700 ${className}`}
    >
      <h3 className="text-gray-400 text-sm">{t(title)}</h3>
      <div className="text-xl font-bold whitespace-nowrap">{value}</div>
    </div>
  );
}
