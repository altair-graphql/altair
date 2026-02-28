import { describe, expect, jest, it, beforeEach } from '@jest/globals';
import { ObjectLocalStorage } from './object-local-storage';

describe('ObjectLocalStorage', () => {
  let storage: ObjectLocalStorage;

  beforeEach(() => {
    storage = new ObjectLocalStorage({});
  });

  it('should return length of data', () => {
    storage = new ObjectLocalStorage({ a: '1', b: '2', c: '3' });
    expect(storage.length).toBe(3);
  });

  it('should return 0 for empty data', () => {
    expect(storage.length).toBe(0);
  });

  it('should get item from data', () => {
    storage = new ObjectLocalStorage({ key: 'value' });
    expect(storage.getItem('key')).toBe('value');
  });

  it('should return undefined for non-existent key', () => {
    expect(storage.getItem('nonexistent')).toBeUndefined();
  });

  it('should set item in data', () => {
    storage.setItem('key', 'value');
    expect((storage as any).data.key).toBe('value');
  });

  it('should update existing item', () => {
    storage.setItem('key', 'old');
    storage.setItem('key', 'new');
    expect((storage as any).data.key).toBe('new');
  });

  it('should remove item from data', () => {
    storage = new ObjectLocalStorage({ key: 'value' });
    storage.removeItem('key');
    expect((storage as any).data.key).toBeUndefined();
  });

  it('should clear all data', () => {
    storage = new ObjectLocalStorage({ a: '1', b: '2' });
    storage.clear();
    expect(storage.length).toBe(0);
  });

  it('should return key at index', () => {
    storage = new ObjectLocalStorage({ first: '1', second: '2' });
    expect(storage.key(0)).toBe('first');
    expect(storage.key(1)).toBe('second');
  });

  it('should return null for out of bounds index', () => {
    storage = new ObjectLocalStorage({ a: '1' });
    expect(storage.key(5)).toBeNull();
  });

  it('should iterate over storage items', () => {
    storage = new ObjectLocalStorage({ key1: 'value1', key2: 'value2' });
    const entries = [...storage];
    expect(entries).toEqual([
      ['key1', 'value1'],
      ['key2', 'value2'],
    ]);
  });
});
