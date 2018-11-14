class Store {
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

const store = new Store();

const getStore = () => store;

module.exports = {
  getStore
};
