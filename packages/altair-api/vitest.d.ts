import 'vitest';

declare module 'vitest' {
  interface CustomMatchers<R = unknown> {
    toBeUser(): R;
    toBePlanConfig(): R;
    toBeSubscriptionItem(): R;
    toBePlan(): R;
    toBeUserStats(): R;
    toBeBcryptHash(): R;
  }

  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
