import { of } from 'rxjs';
import { Store } from '@ngrx/store';

type AnyFunction = (...args: any[]) => any;
export const anyFn = () => jest.fn() as AnyFunction;
export function mock<T>(obj: Partial<T> = {}): T {
  return obj as T;
}

export function mockStoreFactory<T>(obj: Partial<T> = {}): Store<T> {
  const store = of(obj);
  (store as any).dispatch = jest.fn();
  return store as Store<T>;
}
