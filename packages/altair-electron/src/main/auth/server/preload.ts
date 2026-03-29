import { contextBridge, ipcRenderer } from 'electron';
import { IPC_SET_CUSTOM_TOKEN_EVENT } from './index';

contextBridge.exposeInMainWorld('electronAPI', {
  setCustomToken: (token: string) =>
    ipcRenderer.send(IPC_SET_CUSTOM_TOKEN_EVENT, token),
});
