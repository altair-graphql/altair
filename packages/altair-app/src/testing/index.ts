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


/**
 * Resources
 * ---------
 * https://medium.com/google-developer-experts/angular-2-testing-guide-a485b6cb1ef0#.o7kcihstz
 * https://www.vincecampanale.com/blog/2018/03/22/testing-custom-events-angular/
 * https://www.concretepage.com/angular/angular-test-input-text#NgModel
 */
