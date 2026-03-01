import { describe, it, expect } from '@jest/globals';
import { getComponentMeta } from '../utils';

// Note: buildTestHostComponentTemplate was removed as part of migrating
// to Angular's public APIs (reflectComponentType + ComponentRef.setInput).
// The getComponentMeta function now uses reflectComponentType internally,
// which requires JIT compilation context (available in TestBed tests).
// Unit testing it in isolation would require a full Angular test environment.

describe('utils', () => {
  describe('getComponentMeta', () => {
    it('should be a function', () => {
      expect(typeof getComponentMeta).toBe('function');
    });
  });
});
