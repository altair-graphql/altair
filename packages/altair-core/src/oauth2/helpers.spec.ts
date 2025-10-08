import { describe, expect, it } from '@jest/globals';
import {
  base64EncodeSafe,
  base64UrlEncode,
  getCodeChallenge,
  hex,
  secureRandomString,
  sha256,
} from './helpers';

describe('oauth2 helpers', () => {
  describe('secureRandomString', () => {
    it('should generate a random string', () => {
      const out = secureRandomString(64);
      expect(out).toHaveLength(64);
      const out2 = secureRandomString(64);
      expect(out2).toHaveLength(64);
      expect(out).not.toBe(out2);
    });
    it('should generate a 16 character string by default', () => {
      const out = secureRandomString();
      expect(out).toHaveLength(16);
    });
    it('should generate a code verifier spec compliant string', () => {
      const out = secureRandomString(128);
      expect(out).toMatch(/^[A-Za-z0-9\-._~]{43,128}$/);
    });
  });
  describe('base64UrlEncode', () => {
    it('should encode a string to base64url', () => {
      const out = base64UrlEncode(new TextEncoder().encode('hello world').buffer);
      expect(out).toBe('aGVsbG8gd29ybGQ');
    });
  });

  describe('sha256', () => {
    it('should hash a string using SHA-256', async () => {
      const str = JSON.stringify({ a: 'a', b: [1, 2, 3, 4], foo: { c: 'bar' } });
      const out = await sha256(str);
      const hexed = hex(out);
      expect(hexed).toBe(
        '04aa106279f5977f59f9067fa9712afc4aedc6f5862a8defc34552d8c7206393'
      );
    });

    it('should return expected hash for an empty string', async () => {
      const out = await sha256('');
      const hexed = hex(out);

      // https://www.scivision.dev/sha256-hash-empty-file/
      expect(hexed).toBe(
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      );
    });
  });

  describe('getCodeChallenge', () => {
    it.each([
      // random samples from https://example-app.com/pkce
      [
        '075f4a07eb8e645d4857f9c8debd85fc867e963da49a7f76583ed453',
        'boifgebQR7BmZyyNRkG-Q8B-f-Ex8VGD3hRK1tTfmic',
      ],
      [
        'd874bb0fcb35b0a7b52af7c3f3fc5180667fe427ba3dedbfa0dadd5b',
        'I8r8ci9TjlPpOvU6Vm32Ya3sLXIS4XVQwZ4_hrFWIz8',
      ],
      [
        '63a4b655ae5a4e2204d984f516c8c36b628b040fbd1840fb546e943a',
        'CiU3jN5rx9NMCmgFG-PETaoPTlBjkhT9U6bH68CoUdk',
      ],
      [
        'bWrd3MfgGswVQXR54T3nnXY7lGgnIDrpcFEL5cSqxrdQpZCP30Ls5UKuviRS2R6kwtbOUyFjtKjthuZe6MucVdZtXZFrr9v2BkydYvGbAB7FOx6_-_whBvhF1XNpC9il',
        'entSJG70NsTQypzbSNd6Koq6Zv2hBT6aXpHncJ5AX8M',
      ],
    ])('should encode a string to base64url', async (str, expected) => {
      const out = await getCodeChallenge(str);
      expect(out).toBe(expected);
    });
  });

  describe('base64EncodeSafe', () => {
    it('should encode a string to base64', () => {
      const out = base64EncodeSafe('hello world');
      expect(out).toBe('aGVsbG8gd29ybGQ=');
    });

    it('should encode a unicode string to base64', () => {
      expect(base64EncodeSafe('你好，世界')).toBe('5L2g5aW977yM5LiW55WM');

      expect(base64EncodeSafe('👋🌍')).toBe('8J+Ri/CfjI0=');

      expect(base64EncodeSafe('a Ā 𐀀 文 🦄')).toBe('YSDEgCDwkICAIOaWhyDwn6aE');
    });
  });
});
