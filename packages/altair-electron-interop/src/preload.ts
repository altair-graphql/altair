import { contextBridge } from 'electron';
import { electronApi } from './api';
import { electronApiKey } from './constants';

contextBridge.exposeInMainWorld(electronApiKey, electronApi);
