import '@vitest/expect';

declare module '@vitest/expect' {
  interface Matchers<T = any> {
    toBeUser(): T;
    toBePlanConfig(): T;
    toBeSubscriptionItem(): T;
    toBePlan(): T;
    toBeUserStats(): T;
    toBeBcryptHash(): T;
  }

  interface AsymmetricMatchersContaining {
    toBeUser(): any;
    toBePlanConfig(): any;
    toBeSubscriptionItem(): any;
    toBePlan(): any;
    toBeUserStats(): any;
    toBeBcryptHash(): any;
  }
}

export {};
