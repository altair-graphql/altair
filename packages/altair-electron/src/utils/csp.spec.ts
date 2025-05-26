import { cspAsString } from './csp';

describe('cspAsString', () => {
  it('should return a valid CSP string', () => {
    const csp = {
      'default-src': ["'self'", "'unsafe-inline'"],
      'script-src': [
        "'self'",
        'sha256-abc123',
        'https://example.com',
        "'nonce-xyz789'",
        'unsafe-eval',
      ],
      'style-src': ["'self'", "'nonce-xyz789'"],
    };

    const result = cspAsString(csp);
    expect(result).toBe(
      "default-src 'self' 'unsafe-inline'; script-src 'self' 'sha256-abc123' https://example.com 'nonce-xyz789' 'unsafe-eval'; style-src 'self' 'nonce-xyz789'"
    );
  });
});
