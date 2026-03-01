import { TestBed, inject } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { DbService } from './db.service';

describe('DbService', () => {
  let service: DbService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [DbService],
      teardown: { destroyAfterEach: false },
    });
    service = TestBed.inject(DbService);
  });

  it('should ...', inject([DbService], (service: DbService) => {
    expect(service).toBeTruthy();
  }));

  describe('getItemByExactKey', () => {
    it('should return null when key does not exist', async () => {
      const result = await firstValueFrom(service.getItemByExactKey('nonexistent'));
      expect(result).toBeNull();
    });

    it('should return parsed value when key exists with valid JSON', async () => {
      localStorage.setItem('myKey', JSON.stringify({ value: 42 }));
      const result = await firstValueFrom(service.getItemByExactKey('myKey'));
      expect(result).toBe(42);
    });

    it('should return raw string when value is invalid JSON', async () => {
      localStorage.setItem('myKey', 'not-json');
      const result = await firstValueFrom(service.getItemByExactKey('myKey'));
      expect(result).toBe('not-json');
    });
  });

  describe('getItem', () => {
    it('should get item using prefixed key', async () => {
      const key = `${service.storagePrefix}${service.servicePrefix}testKey`;
      localStorage.setItem(key, JSON.stringify({ value: 'hello' }));
      const result = await firstValueFrom(service.getItem('testKey'));
      expect(result).toBe('hello');
    });

    it('should return null when item does not exist', async () => {
      const result = await firstValueFrom(service.getItem('missingKey'));
      expect(result).toBeNull();
    });
  });

  describe('setItem', () => {
    it('should store value in localStorage', async () => {
      await firstValueFrom(service.setItem('myKey', 'myValue'));
      const key = `${service.storagePrefix}${service.servicePrefix}myKey`;
      const stored = JSON.parse(localStorage.getItem(key) || '{}');
      expect(stored.value).toBe('myValue');
    });

    it('should not store when key is empty', async () => {
      const before = localStorage.length;
      await firstValueFrom(service.setItem('', 'value'));
      expect(localStorage.length).toBe(before);
    });

    it('should not store when value is undefined', async () => {
      const before = localStorage.length;
      await firstValueFrom(service.setItem('key', undefined));
      expect(localStorage.length).toBe(before);
    });

    it('should emit null', async () => {
      const result = await firstValueFrom(service.setItem('k', 'v'));
      expect(result).toBeNull();
    });
  });

  describe('removeItemByExactKey', () => {
    it('should remove item from localStorage', async () => {
      localStorage.setItem('exactKey', 'val');
      await firstValueFrom(service.removeItemByExactKey('exactKey'));
      expect(localStorage.getItem('exactKey')).toBeNull();
    });

    it('should emit null', async () => {
      const result = await firstValueFrom(service.removeItemByExactKey('anyKey'));
      expect(result).toBeNull();
    });
  });

  describe('removeItem', () => {
    it('should remove item using prefixed key', async () => {
      const key = `${service.storagePrefix}${service.servicePrefix}toRemove`;
      localStorage.setItem(key, 'val');
      await firstValueFrom(service.removeItem('toRemove'));
      expect(localStorage.getItem(key)).toBeNull();
    });
  });

  describe('getAllKeys', () => {
    it('should return all keys matching storage prefix', async () => {
      await firstValueFrom(service.setItem('key1', 'v1'));
      await firstValueFrom(service.setItem('key2', 'v2'));
      const keys = await firstValueFrom(service.getAllKeys());
      expect(Array.isArray(keys)).toBe(true);
    });

    it('should return array', async () => {
      const keys = await firstValueFrom(service.getAllKeys());
      expect(Array.isArray(keys)).toBe(true);
    });
  });
});
