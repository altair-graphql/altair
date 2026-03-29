import { describe, expect, it } from 'vitest';
import { parseJson } from './json';

describe('json utils', () => {
  describe('parseJson', () => {
    it('should parse a JSON string into an object', () => {
      const obj = parseJson('{"a": 1}');
      expect(obj).toEqual({ a: 1 });
    });

    it('should return a default value if parsing fails', () => {
      const obj = parseJson('{"a": 1');
      expect(obj).toEqual({});
    });

    it('should return a specified default value if parsing fails', () => {
      const obj = parseJson('{"a": 1', { defaultValue: { a: 1 } });
      expect(obj).toEqual({ a: 1 });
    });

    it('should return a specified default value if parsing fails', () => {
      const obj = parseJson('{"a": 1', { defaultValue: null });
      expect(obj).toBeNull();
    });

    it('should parse a JSON string with BigInt', () => {
      const obj = parseJson(
        '{"a": 1011111111111111111111111111111111111111111111111111111 }'
      );
      expect((obj as { a: bigint }).a.toString()).toEqual(
        '1.011111111111111111111111111111111111111111111111111111e+54'
      );
    });
  });
});
