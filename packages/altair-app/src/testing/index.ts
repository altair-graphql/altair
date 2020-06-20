type AnyFunction = (...args: any[]) => any;
export const anyFn = (): AnyFunction => jest.fn();
export function mock<T>(obj: Partial<T> = {}): T {
  return obj as T;
}
