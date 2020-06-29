const { PersistentStore } = require('../store');

// An interface between localStorage and electron-store
class ElectronStoreAdapter {
  constructor() {
    this.store = new PersistentStore();
  }

  /**
   * Returns the number of key/value pairs currently present in the list associated with the object.
   */
  // readonly length: number;
  get length() {
    return this.store.size;
  }

  /**
   * Empties the list associated with the object of all key/value pairs, if there are any.
   */
  // clear(): void;
  clear() {
    return this.store.clear();
  }

  /**
   * Returns the current value associated with the given key, or null if the given key does not exist in the list associated with the object.
   */
  // getItem(key: string): string | null;
  getItem(key) {
    return this.store.get(key);
  }

  /**
   * Returns the name of the nth key in the list, or null if n is greater than or equal to the number of key/value pairs in the object.
   */
  // key(index: number): string | null;
  key(index) {
    const key = Object.keys(this.store.store)[index];
    return key || null;
  }

  /**
   * Removes the key/value pair with the given key from the list associated with the object, if a key/value pair with the given key exists.
   */
  // removeItem(key: string): void;
  removeItem(key) {
    return this.store.delete(key);
  }

  /**
   * Sets the value of the pair identified by key to value, creating a new key/value pair if none existed for key previously.
   *
   * Throws a "QuotaExceededError" DOMException exception if the new value couldn't be set. (Setting could fail if, e.g., the user has disabled storage for the site, or if the quota has been exceeded.)
   */
  // setItem(key: string, value: string): void;
  setItem(key, value) {
    return this.store.set(key, value);
  }

  *[Symbol.iterator]() {
		for (const [key, value] of Object.entries(this.store)) {
			yield [key, value];
		}
	}
}

module.exports = ElectronStoreAdapter;
