import { describe, expect } from '@jest/globals';
import { generateCurl } from './curl';

describe('generateCurl', () => {
  it('generated expected result', () => {
    const res = generateCurl({
      url: 'https://altairgraphql.dev',
      data: {
        x: '1',
      },
      headers: {
        'X-api-token': 'xyz',
      },
      method: 'POST',
    });

    expect(res).toBe(
      `curl 'https://altairgraphql.dev' -X POST -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'Origin: http://localhost' -H 'X-api-token: xyz' --data-binary '{"x":"1"}' --compressed`
    );
  });

  it('should generate curl with GET method and query params', () => {
    const res = generateCurl({
      url: 'https://example.com',
      method: 'GET',
      data: { query: 'hello', op: 'test' },
    });
    expect(res).toBe(`curl 'https://example.com?query=hello&op=test' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'Origin: http://localhost' --compressed`);
  });

  it('should append params to URL that already has query string', () => {
    const res = generateCurl({
      url: 'https://example.com?existing=1',
      method: 'GET',
      data: { extra: 'val' },
    });
    expect(res).toBe(`curl 'https://example.com?existing=1&extra=val' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'Origin: http://localhost' --compressed`);
  });

  it('should generate curl with DELETE method and -X flag', () => {
    const res = generateCurl({
      url: 'https://example.com',
      method: 'DELETE',
      data: { id: '123' },
    });
    expect(res).toBe(`curl 'https://example.com' -X DELETE -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'Origin: http://localhost' --data-binary '{"id":"123"}' --compressed`);
  });

  it('should generate curl with PUT method and -X flag', () => {
    const res = generateCurl({
      url: 'https://example.com',
      method: 'PUT',
      data: { name: 'test' },
    });
    expect(res).toBe(`curl 'https://example.com' -X PUT -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'Origin: http://localhost' --data-binary '{"name":"test"}' --compressed`);
  });
});
