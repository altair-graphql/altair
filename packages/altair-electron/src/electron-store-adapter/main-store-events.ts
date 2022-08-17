import { ipcMain } from "electron";
import { PersistentStore } from "../store";
import { EVENTS } from "./constants";

export const initMainProcessStoreEvents = () => {
  const store = new PersistentStore();

  ipcMain.on(EVENTS.LENGTH, e => {
    e.returnValue = store.size;
  });

  ipcMain.on(EVENTS.CLEAR, e => {
    e.returnValue = store.clear();
  });

  ipcMain.on(EVENTS.GET_ITEM, (e, key) => {
    e.returnValue = store.get(key);
  });

  ipcMain.on(EVENTS.KEY_BY_INDEX, (e, index) => {
    const key = Object.keys(store.store)[index];
    e.returnValue = key || null;
  });

  ipcMain.on(EVENTS.REMOVE_ITEM, (e, key) => {
    e.returnValue = store.delete(key);
  });

  ipcMain.on(EVENTS.SET_ITEM, (e, key, value) => {
    e.returnValue = store.set(key, value);
  });

  ipcMain.on(EVENTS.GET_STORE_OBJECT, e => {
    e.returnValue = store.store;
  });
};
