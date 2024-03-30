import { describe, expect, it } from '@jest/globals';
import BearerAuthorizationProvider from './bearer';

describe('basic', () => {
  it('should return basic auth header', async () => {
    const authProvider = new BearerAuthorizationProvider((x) => x);

    const res = await authProvider.execute({
      data: {
        token: 'tk_1a2s3d4f5g6h7j8k9l0',
      },
    });

    expect(res).toEqual({
      headers: {
        Authorization: 'Bearer tk_1a2s3d4f5g6h7j8k9l0',
      },
    });
  });
});
