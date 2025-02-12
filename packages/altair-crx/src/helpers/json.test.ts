import { describe, expect, it } from 'vitest';
import { parseJson } from './json';
describe('parseJson', () => {
  it('should correctly parse valid JSON', () => {
    const jsonStr = '{"name": "Altair", "version": 1}';
    const result = parseJson(jsonStr);
    expect(result).toEqual({ name: 'Altair', version: 1 });
  });

  it('should return undefined for invalid JSON', () => {
    const invalidJson = '{name:"Altair", version:1}';
    const result = parseJson(invalidJson);
    expect(result).toBeUndefined();
  });
});
