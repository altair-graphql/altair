type AnyFunction = (...args: any[]) => any;
export const anyFn = () => jest.fn() as AnyFunction;
export function mock<T>(obj: Partial<T> = {}): T {
  return obj as T;
}
