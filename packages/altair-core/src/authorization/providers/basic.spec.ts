import { describe, expect, it } from 'vitest';
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
  it('should return basic auth header with environment variables', async () => {
    const authProvider = new BasicAuthorizationProvider((x) =>
      x.replace(/(^{{)|(}}$)/g, '')
    );

    const res = await authProvider.execute({
      data: {
        username: '{{username}}',
        password: '{{password}}',
      },
    });

    expect(res).toEqual({
      headers: {
        Authorization: 'Basic dXNlcm5hbWU6cGFzc3dvcmQ=',
      },
    });
  });

  it('should not return headers if username or password is missing', async () => {
    const authProvider = new BasicAuthorizationProvider((x) => x);

    const res = await authProvider.execute({
      data: {
        username: '',
        password: '',
      },
    });

    expect(res).toEqual({
      headers: {},
    });
  });
});
