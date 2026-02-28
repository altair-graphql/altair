import { describe, expect, jest, it, beforeEach, afterEach } from '@jest/globals';
import { PerformantLocalStorage } from './performant-local-storage';

describe('PerformantLocalStorage', () => {
  let storage: PerformantLocalStorage;

  beforeEach(() => {
    jest.restoreAllMocks();
    storage = new PerformantLocalStorage();
  });

  it('should get item from underlying storage', () => {
    localStorage.setItem('mykey', 'myval');
    expect(storage.getItem('mykey')).toBe('myval');
  });

  it('should return null for missing key', () => {
    expect(storage.getItem('missing_key_xyz')).toBeNull();
  });

  it('should remove item from underlying storage', () => {
    localStorage.setItem('toremove', 'val');
    storage.removeItem('toremove');
    expect(storage.getItem('toremove')).toBeNull();
  });

  it('should clear all items', () => {
    localStorage.setItem('a', '1');
    storage.clear();
    expect(storage.getItem('a')).toBeNull();
  });

  describe('setItem', () => {
    it('should set item directly when requestIdleCallback is not available', () => {
      const origRic = (window as any).requestIdleCallback;
      delete (window as any).requestIdleCallback;
      storage.setItem('directKey', 'directVal');
      expect(storage.getItem('directKey')).toBe('directVal');
      if (origRic) {
        (window as any).requestIdleCallback = origRic;
      }
    });

    it('should schedule via requestIdleCallback when available', () => {
      const mockRic = jest.fn().mockReturnValue(1) as any;
      (window as any).requestIdleCallback = mockRic;
      storage.setItem('idleKey', 'idleVal');
      expect(mockRic).toHaveBeenCalled();
      delete (window as any).requestIdleCallback;
    });

    it('should cancel previous callback when same key is set again', () => {
      const mockCic = jest.fn() as any;
      const mockRic = jest.fn().mockReturnValue(42) as any;
      (window as any).requestIdleCallback = mockRic;
      (window as any).cancelIdleCallback = mockCic;
      storage.setItem('sameKey', 'val1');
      storage.setItem('sameKey', 'val2');
      expect(mockCic).toHaveBeenCalledWith(42);
      delete (window as any).requestIdleCallback;
      delete (window as any).cancelIdleCallback;
    });
  });
});
