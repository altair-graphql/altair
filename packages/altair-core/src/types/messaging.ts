import { ExportWindowState } from './state/window.interfaces';

type WebExtensionPingMessage = {
  type: 'ping';
};

type WebExtensionPongMessage = {
  type: 'pong';
};

type WebExtensionReadyMessage = {
  type: 'ready';
};

type WebExtensionImportWindowMessage = {
  type: 'import-window';
  window: ExportWindowState;
};

export type WebExtensionMessage =
  | WebExtensionImportWindowMessage
  | WebExtensionPingMessage
  | WebExtensionPongMessage
  | WebExtensionReadyMessage;
