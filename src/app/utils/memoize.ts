import * as memoizee from 'memoizee';

export const memoize = function(): MethodDecorator {
  return function(target, key, descriptor: PropertyDescriptor) {
    const oldFn = descriptor.value;
    const newFn = memoizee(oldFn);
    descriptor.value = function() {
      return newFn.apply(this, arguments);
    };
  };
};
