import { PropsWithChildren, useMemo } from 'react';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import { useApi } from '../hooks';

export const GraphqlProvider = ({ children }: PropsWithChildren<unknown>) => {
  const { network } = useApi();

  const client = useMemo(
    () =>
      new ApolloClient({
        uri: network.subquery?.endpoint,
        cache: new InMemoryCache(),
      }),
    [network.subquery]
  );

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
