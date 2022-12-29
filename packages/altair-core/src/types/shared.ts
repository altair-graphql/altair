export type IDictionary<V = any> = Record<string, V>;

export type TODO = any;

// export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface BaseDocument {
  id: string;
  created_at?: number;
  updated_at?: number;
}

export interface BaseOwnableDocument extends BaseDocument {
  ownerUid: string;
}

type TypedOmit<T, K extends keyof T> = Omit<T, K>;
export type CreateDTO<
  T extends BaseDocument | BaseOwnableDocument
> = T extends BaseOwnableDocument
  ? TypedOmit<T, keyof BaseOwnableDocument>
  : TypedOmit<T, keyof BaseDocument>;
export type UpdateDTO<T extends BaseDocument | BaseOwnableDocument> = CreateDTO<
  T
> &
  Pick<T, 'id'>;
