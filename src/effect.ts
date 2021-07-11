import { Observable, Subject } from "rxjs";

/**
 * ```ts
 * Example
 *
 * searchProduct = effect<string>(name$ => name$.pipe(
 *     debounceTime(230),
 *     distinctUntilChanged(),
 *     tap(_=>this.emit({status:'loading'})
 *     map(name => name.toUpperCase()),
 *     switchMap(name => api.searchProduct(name)),
 *     tap(products => this.emit({status:'loaded', products}))
 *  )
 * );
 * ```
 *
 */

export function effect<T>(
  fx: (arg$: Observable<T>) => Observable<any>
): (arg: T) => void {
  const subject = new Subject<T>();
  fx(subject).subscribe();
  return (arg: T) => {
    subject.next(arg);
  };
}
