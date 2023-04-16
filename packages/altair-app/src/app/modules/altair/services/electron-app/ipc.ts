import { IpcRenderer } from 'electron';

export const getIpc = () => {
  const ipc: IpcRenderer | undefined = (window as any).ipc;

  return ipc;
};
