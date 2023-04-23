import { IElectronAPI } from '../api';

export class ElectronLocalStorage implements Storage {
  electronApi!: IElectronAPI;

  constructor() {
    if (!window.electronApi) {
      throw new Error('This can only be used in the electron environment');
    }

    this.electronApi = window.electronApi;
  }

  get length() {
    return this.electronApi.store.getLength() ?? 0;
  }

  clear(): void {
    return this.electronApi.store.clear();
  }
  getItem(key: string) {
    return this.electronApi.store.getItem(key);
  }
  key(index: number) {
    return this.electronApi.store.key(index);
  }
  removeItem(key: string) {
    return this.electronApi.store.removeItem(key);
  }
  setItem(key: string, value: string) {
    return this.electronApi.store.setItem(key, value);
  }

  *[Symbol.iterator]() {
    for (const [key, value] of Object.entries(
      this.electronApi.store.getStore()
    )) {
      yield [key, value];
    }
  }
}

export const electronLocalStorage = window.electronApi
  ? new ElectronLocalStorage()
  : undefined;
