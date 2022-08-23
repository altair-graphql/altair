import memoizee from 'memoizee';

export function memoize(): MethodDecorator {
  return function (target, key, descriptor: PropertyDescriptor) {
    const oldFn = descriptor.value;
    const newFn = memoizee(oldFn, { max: 1 });
    descriptor.value = function (...args: any[]) {
      return newFn.apply(this, args);
    };
  };
}
