import React from 'react';

type Props = {
  amount: string;
  integerClassName?: string;
  decimalClassName?: string;
};

const Component: React.FC<Props> = ({ amount, integerClassName, decimalClassName }) => {
  const [integer, decimal] = amount.split('.');
  return (
    <>
      <span className={`font-bold ${integerClassName}`}>{decimal ? `${integer}.` : integer}</span>
      {decimal && <span className={`font-normal opacity-60 ${decimalClassName}`}>{decimal}</span>}
    </>
  );
};

export const PrettyAmount = React.memo(Component);
