import ElectronStore from 'electron-store';

export class InMemoryStore {
  data: Record<string, unknown>;

  constructor() {
    this.data = {};
  }

  /**
   * @param {string} key key to search for
   */
  get(key: string) {
    return this.data[key];
  }

  /**
   * @param {string} key key of item
   * @param {any} val value of item
   */
  set(key: string, val: unknown) {
    this.data[key] = val;
  }

  /**
   * @param {string} key key of item
   */
  delete(key: string) {
    return Reflect.deleteProperty(this.data, key);
  }
}

export class PersistentStore<
  T extends Record<string, any> = Record<string, unknown>,
> extends ElectronStore<T> {}
