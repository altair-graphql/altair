declare namespace jest {
  interface Matchers<R> {
    toBeUser(): R;
    toBePlanConfig(): R;
    toBeSubscriptionItem(): R;
  }
}
