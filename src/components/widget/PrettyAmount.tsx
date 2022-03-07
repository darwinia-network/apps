import React from 'react';

type Props = {
  amount: string;
  integerClassName?: string;
  decimalClassName?: string;
};

const Component: React.FC<Props> = ({ amount, integerClassName, decimalClassName }) => {
  const amountSplited = amount.split('.');
  return (
    <>
      <span className={`font-bold ${integerClassName}`}>{amountSplited[0]}.</span>
      <span className={`font-normal opacity-60 ${decimalClassName}`}>
        {amountSplited.length > 1 ? amountSplited[1] : '0'}
      </span>
    </>
  );
};

export const PrettyAmount = React.memo(Component);
