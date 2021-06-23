export interface Header {
  key: string;
  value: string;
  enabled?: boolean;
}

export type HeaderState = Header[];
