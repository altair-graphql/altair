import { HeaderState } from 'altair-graphql-core/build/types/state/header.interfaces';

export interface InteropWindowState {
  windowId: string;
  headers: HeaderState;
  showDocs: boolean;
}

export interface InteropAppState {
  windows: Record<string, InteropWindowState>;
  activeWindowId?: string;
}
