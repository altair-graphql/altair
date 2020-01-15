import * as memoizee from 'memoizee';

export function memoize(): MethodDecorator {
  return function(target, key, descriptor: PropertyDescriptor) {
    const oldFn = descriptor.value;
    const newFn = memoizee(oldFn);
    descriptor.value = function() {
      return newFn.apply(this, arguments);
    };
  };
};
