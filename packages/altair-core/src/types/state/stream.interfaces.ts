
export interface StreamState {
  url: string;
  type: 'event' | '';
  client?: EventSource;
  isConnected: boolean;
  failed: any;
}
