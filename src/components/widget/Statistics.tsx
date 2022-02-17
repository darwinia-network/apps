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
      className={`flex flex-col justify-center gap-4 w-full lg:w-2/3 relative border-r border-gray-100 dark:border-gray-700 ${className}`}
    >
      <h3 className="text-gray-400 text-sm">{t(title)}</h3>
      <div className="text-xl font-bold whitespace-nowrap">{value}</div>
    </div>
  );
}
