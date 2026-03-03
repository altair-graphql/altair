import { of } from 'rxjs';
import { Store } from '@ngrx/store';

type AnyFunction<R = unknown> = (...args: unknown[]) => R;
export const anyFn = <R>() => vi.fn() as AnyFunction<R>;
export function mock<T>(obj: Partial<T> = {}): T {
  return obj as T;
}

export function mockStoreFactory<T>(obj: Partial<T> = {}): Store<T> {
  const store = of(obj);
  (store as any).dispatch = vi.fn();
  (store as any).select = (
    ...args: [
      key1: string | number | symbol,
      key2: string | number | symbol,
      key3: string | number | symbol,
      key4: string | number | symbol,
      key5: string | number | symbol,
      key6: string | number | symbol,
      ...paths: string[],
    ]
  ) => Store.prototype.select.apply(store, args);
  return store as Store<T>;
}

export * from './utils';
export * from './wrapper';
