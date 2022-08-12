export type IDictionary<V = any> = Record<string, V>;

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type TODO = any;

export type UnknownError = TODO;

export interface TrackByIdItem {
  id: string;
}
