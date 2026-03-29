import { describe, expect, it } from 'vitest';
import { headerListToMap, headerMapToList } from './headers';

describe('headers utils', () => {
  describe('headerListToMap', () => {
    it('should convert header list to map', () => {
      const headerMap = headerListToMap([
        { key: 'key1', value: 'value1', enabled: true },
        { key: 'key2', value: 'value2', enabled: true },
        { key: 'key3', value: 'value3', enabled: false },
      ]);

      expect(headerMap).toEqual({
        key1: 'value1',
        key2: 'value2',
      });
    });
  });

  describe('headerMapToList', () => {
    it('should convert header map to list', () => {
      const headerList = headerMapToList({
        key1: 'value1',
        key2: 'value2',
      });

      expect(headerList).toEqual([
        { key: 'key1', value: 'value1', enabled: true },
        { key: 'key2', value: 'value2', enabled: true },
      ]);
    });
  });
});
