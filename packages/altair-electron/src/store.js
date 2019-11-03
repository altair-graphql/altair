const ElectronStore = require('electron-store');

class InMemoryStore {
  constructor() {
    this.data = {};
  }
  get(key) {
    return this.data[key];
  }

  set(key, val) {
    this.data[key] = val;
  }

  delete(key) {
    delete this.data[key];
  }
}

const store = new InMemoryStore();

const getStore = () => store;

const persistentStore = new ElectronStore();
const getPersistentStore = () => persistentStore;

module.exports = {
  getStore,
  getPersistentStore,
};
