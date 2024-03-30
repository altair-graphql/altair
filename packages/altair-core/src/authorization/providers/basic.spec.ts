import { describe, expect, it } from '@jest/globals';
import BasicAuthorizationProvider from './basic';

describe('basic', () => {
  it('should return basic auth header', async () => {
    const authProvider = new BasicAuthorizationProvider((x) => x);

    const res = await authProvider.execute({
      data: {
        username: 'username',
        password: 'password',
      },
    });

    expect(res).toEqual({
      headers: {
        Authorization: 'Basic dXNlcm5hbWU6cGFzc3dvcmQ=',
      },
    });
  });
});
