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
      `curl 'https://altairgraphql.dev' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'Origin: http://localhost' -H 'X-api-token: xyz' --data-binary '{"x":"1"}' --compressed`
    );
  });
});
