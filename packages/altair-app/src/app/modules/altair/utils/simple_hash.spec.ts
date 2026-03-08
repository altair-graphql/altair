import { hash, uaSeedHash } from './simple_hash';

describe('hash', () => {
  it('should return consistent hash for same string', () => {
    const result1 = hash('test');
    const result2 = hash('test');
    expect(result1).toBe(result2);
  });

  it('should return different hashes for different strings', () => {
    const hash1 = hash('hello');
    const hash2 = hash('world');
    expect(hash1).not.toBe(hash2);
  });

  it('should handle empty string', () => {
    const result = hash('');
    expect(result).toBeDefined();
  });

  it('should handle null/undefined', () => {
    const result = hash(null as any);
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('should handle string with special characters', () => {
    const result = hash('!@#$%^&*()_+-=[]{}|;:,.<>?');
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('should handle unicode characters', () => {
    const result = hash('你好世界');
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('should handle very long strings', () => {
    const longString = 'a'.repeat(10000);
    const result = hash(longString);
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('should handle strings with numbers', () => {
    const result = hash('1234567890');
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });
});
