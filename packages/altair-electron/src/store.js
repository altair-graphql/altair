const ElectronStore = require('electron-store');

class InMemoryStore {
  constructor() {
    this.data = {};
  }

  /**
   * @param {string} key key to search for
   */
  get(key) {
    return this.data[key];
  }

  /**
   * @param {string} key key of item
   * @param {any} val value of item
   */
  set(key, val) {
    this.data[key] = val;
  }

  /**
   * @param {string} key key of item
   */
  delete(key) {
    return Reflect.deleteProperty(this.data, key);
  }
}

class PersistentStore extends ElectronStore {}


module.exports = {
  InMemoryStore,
  PersistentStore,
};
