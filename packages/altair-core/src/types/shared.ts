export interface IDictionary<V = any> {
  [ key: string ]: V;
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type TODO = any;
