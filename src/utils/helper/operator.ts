import { isFunction } from 'lodash';
import { last, MonoTypeOperatorFunction, Observer, scan, switchMapTo, takeWhile, tap, timer } from 'rxjs';
import { Tx, WithOptional } from '../../model';

function attemptsGuardFactory(maxAttempts: number) {
  return (attemptsCount: number) => {
    if (attemptsCount > maxAttempts) {
      throw new Error(`Exceeded maxAttempts: ${maxAttempts}, actual attempts: ${attemptsCount}`);
    }
  };
}

/**
 * @function pollWhile - Custom rxjs operator
 * @params  maxAttempts - polling will be canceled when attempts count reached even there is no result.
 * @params  emitOnlyLast - omit the values before the result
 * @description polling until there is a result
 */
export function pollWhile<T>(
  pollInterval: number,
  isPollingActive: (res: T) => boolean,
  maxAttempts = Infinity,
  emitOnlyLast = false
): MonoTypeOperatorFunction<T> {
  return (source$) => {
    const poll$ = timer(0, pollInterval).pipe(
      scan((attempts) => ++attempts, 0),
      tap(attemptsGuardFactory(maxAttempts)),
      switchMapTo(source$),
      takeWhile(isPollingActive, true)
    );

    return emitOnlyLast ? poll$.pipe(last()) : poll$;
  };
}

export function combineObserver<T = Tx>(...observers: WithOptional<Observer<T>, 'complete' | 'error'>[]): Observer<T> {
  const passOn =
    <V>(method: 'next' | 'error' | 'complete') =>
    (data: V) => {
      try {
        observers.forEach((observer) => {
          const fn = observer[method];

          if (isFunction(fn)) {
            fn(data as unknown as T);
          }
        });
      } catch (err) {
        console.log('%c [ err ]-42', 'font-size:13px; background:pink; color:#bf2c9f;', err);
      }
    };

  return {
    next: passOn<T>('next'),
    error: passOn<Record<string, unknown>>('error'),
    complete: passOn<void>('complete'),
  };
}
