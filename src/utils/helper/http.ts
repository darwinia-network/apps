import { isNull, isUndefined } from 'lodash';
import { map, Observable } from 'rxjs';
import { ajax } from 'rxjs/ajax';

export interface HttpRequest {
  url: string;
  params: Record<string, string | number | boolean | undefined | null>;
}

export function rxGet<T>({ url, params }: HttpRequest): Observable<T> {
  const queryStr = Object.entries(params || {})
    .filter(([_, value]) => !isNull(value) && !isUndefined(value))
    .reduce((acc, cur) => {
      const pair = `${cur[0]}=${cur[1]}`;

      return acc !== '' ? `${acc}&${pair}` : pair;
    }, '');

  return ajax({
    url: url + (queryStr ? `?${queryStr}` : ''),
    method: 'GET',
  }).pipe(map((res) => res.response as T));
}

export function rxPost<T>({ url, params }: HttpRequest): Observable<T> {
  return ajax({
    url,
    method: 'POST',
    body: params,
  }).pipe(map((res) => res.response as T));
}
