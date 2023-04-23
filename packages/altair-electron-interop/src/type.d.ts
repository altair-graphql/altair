import { IElectronAPI } from './api';
import { electronApiKey } from './constants';

declare global {
  interface Window {
    [electronApiKey]?: IElectronAPI;
  }
}
