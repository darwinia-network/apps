import { useState, useEffect, useRef } from 'react';

import { useApi } from '../hooks';

export const useBestNumber = () => {
  const { api } = useApi();
  const unsubRef = useRef<() => void>();
  const [bestNumber, setBestNumber] = useState<number | null>();

  useEffect(() => {
    (async () => {
      unsubRef.current = await api.rpc.chain.subscribeNewHeads((lastHeader) => {
        setBestNumber(lastHeader.number.toNumber());
      });
    })();

    return () => {
      if (unsubRef.current) {
        unsubRef.current();
      }
    };
  }, [api]);

  return { bestNumber };
};
