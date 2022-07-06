import { useQuery } from '@apollo/client';
import type {
  DocumentNode,
  OperationVariables,
  TypedDocumentNode,
  QueryHookOptions,
  QueryResult,
} from '@apollo/client';

import { LONG_LONG_DURATION } from '../config';

export const usePollIntervalQuery: <TData = any, TVariables = OperationVariables, TTransResult = any>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: QueryHookOptions<TData, TVariables>,
  transform?: (data: TData) => TTransResult
) => Pick<QueryResult<TData, TVariables>, 'data' | 'loading'> & { transformedData?: TTransResult } = (
  query,
  options,
  transform
) => {
  const { data, loading } = useQuery(query, {
    pollInterval: LONG_LONG_DURATION,
    notifyOnNetworkStatusChange: true,
    ...options,
  });

  return { data, loading, transformedData: transform && data ? transform(data) : undefined };
};
