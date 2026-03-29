import { STORE_EVENTS } from '@altairgraphql/electron-interop';
import { ipcMain } from 'electron';
import { PersistentStore } from '../store';

export const initMainProcessStoreEvents = () => {
  const store = new PersistentStore();

  ipcMain.on(STORE_EVENTS.LENGTH, e => {
    e.returnValue = store.size;
  });

  ipcMain.on(STORE_EVENTS.CLEAR, e => {
    e.returnValue = store.clear();
  });

  ipcMain.on(STORE_EVENTS.GET_ITEM, (e, key) => {
    e.returnValue = store.get(key);
  });

  ipcMain.on(STORE_EVENTS.KEY_BY_INDEX, (e, index) => {
    const key = Object.keys(store.store)[index];
    e.returnValue = key || null;
  });

  ipcMain.on(STORE_EVENTS.REMOVE_ITEM, (e, key) => {
    e.returnValue = store.delete(key);
  });

  ipcMain.on(STORE_EVENTS.SET_ITEM, (e, key, value) => {
    e.returnValue = store.set(key, value);
  });

  ipcMain.on(STORE_EVENTS.GET_STORE_OBJECT, e => {
    e.returnValue = store.store;
  });
};
