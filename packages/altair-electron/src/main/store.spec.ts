import { InMemoryStore } from './store';

jest.mock('electron-store');

describe('InMemoryStore', () => {
  it('should create', () => {
    const store = new InMemoryStore();
    expect(store).toBeTruthy();
  });

  describe('.get', () => {
    it('should return undefined if key not found', () => {
      const store = new InMemoryStore();

      expect(store.get('unknown')).toBeUndefined();
    });

    it('should return value if key is found', () => {
      const store = new InMemoryStore();
      store.set('key1', 'value1');

      expect(store.get('key1')).toBe('value1');
    });
  });

  describe('.set', () => {
    it('should set the provided value with key', () => {
      const store = new InMemoryStore();
      store.set('item1', { object: 'value' });

      expect(store.get('item1')).toEqual({ object: 'value' });
    });
  });

  describe('.delete', () => {
    it('should remove the item matching key', () => {
      const store = new InMemoryStore();
      store.set('item1', { object: 'value' });
      store.delete('item1');

      expect(store.get('item1')).toBeUndefined();
    });
  });
});
