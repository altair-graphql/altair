import { IpcRenderer } from "electron";
import { EVENTS } from "./constants";

// An interface between localStorage and electron-store
// Used in renderer process
// Should use ipc to communicate with main process
export class ElectronStoreAdapter {
  constructor(private ipc: IpcRenderer) {}

  get store() {
    return this.ipc.sendSync(EVENTS.GET_STORE_OBJECT);
  }

  /**
   * Returns the number of key/value pairs currently present in the list associated with the object.
   */
  // readonly length: number;
  get length() {
    return this.ipc.sendSync(EVENTS.LENGTH);
  }

  /**
   * Empties the list associated with the object of all key/value pairs, if there are any.
   */
  // clear(): void;
  clear() {
    return this.ipc.sendSync(EVENTS.CLEAR);
  }

  /**
   * Returns the current value associated with the given key, or null if the given key does not exist in the list associated with the object.
   */
  // getItem(key: string): string | null;
  getItem(key: string) {
    return this.ipc.sendSync(EVENTS.GET_ITEM, key);
  }

  /**
   * Returns the name of the nth key in the list, or null if n is greater than or equal to the number of key/value pairs in the object.
   */
  // key(index: number): string | null;
  key(index: string) {
    return this.ipc.sendSync(EVENTS.KEY_BY_INDEX, index);
  }

  /**
   * Removes the key/value pair with the given key from the list associated with the object, if a key/value pair with the given key exists.
   */
  // removeItem(key: string): void;
  removeItem(key: string) {
    return this.ipc.sendSync(EVENTS.REMOVE_ITEM, key);
  }

  /**
   * Sets the value of the pair identified by key to value, creating a new key/value pair if none existed for key previously.
   *
   * Throws a "QuotaExceededError" DOMException exception if the new value couldn't be set. (Setting could fail if, e.g., the user has disabled storage for the site, or if the quota has been exceeded.)
   */
  // setItem(key: string, value: string): void;
  setItem(key: string, value: string) {
    return this.ipc.sendSync(EVENTS.SET_ITEM, key, value);
  }

  *[Symbol.iterator]() {
    for (const [key, value] of Object.entries(this.store)) {
      yield [key, value];
    }
  }
}
