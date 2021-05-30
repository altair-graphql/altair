import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';

type AnyFunction = (...args: any[]) => any;
export const anyFn = () => jest.fn() as AnyFunction;
export function mock<T>(obj: Partial<T> = {}): T {
  return obj as T;
}

export function mockStoreFactory<T>(obj: Partial<T> = {}): Store<T> {
  const store = of(obj);
  (store as any).dispatch = jest.fn();
  (store as any).select = (...args: any[]) => Store.prototype.select.apply(store, args);
  return store as Store<T>;
}

export * from './utils';
export * from './wrapper';

/**
 * Resources
 * ---------
 *
 * https://medium.com/google-developer-experts/angular-2-testing-guide-a485b6cb1ef0#.o7kcihstz
 * https://www.vincecampanale.com/blog/2018/03/22/testing-custom-events-angular/
 * https://www.concretepage.com/angular/angular-test-input-text#NgModel
 *
 * https://gist.github.com/johnpapa/049cc0ee1b3a9a8bf6ce31eddbee508e
 * https://angular.io/guide/dynamic-component-loader
 * https://indepth.dev/here-is-what-you-need-to-know-about-dynamic-components-in-angular/#creating-components-on-the-fly
 */
