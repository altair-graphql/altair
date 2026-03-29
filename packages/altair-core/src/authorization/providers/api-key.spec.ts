import { describe, expect, it } from 'vitest';
import ApiKeyAuthorizationProvider from './api-key';

describe('basic', () => {
  it('should return basic auth header', async () => {
    const authProvider = new ApiKeyAuthorizationProvider((x) => x);

    const res = await authProvider.execute({
      data: {
        headerName: 'X-API-Key',
        headerValue: 'api_1a2s3d4f5g6h7j8k9l0',
      },
    });

    expect(res).toEqual({
      headers: {
        'X-API-Key': 'api_1a2s3d4f5g6h7j8k9l0',
      },
    });
  });
  it('should return basic auth header with environment variables', async () => {
    const authProvider = new ApiKeyAuthorizationProvider((x) =>
      x.replace(/(^{{)|(}}$)/g, '')
    );

    const res = await authProvider.execute({
      data: {
        headerName: 'X-API-Key',
        headerValue: '{{api_1a2s3d4f5g6h7j8k9l0}}',
      },
    });

    expect(res).toEqual({
      headers: {
        'X-API-Key': 'api_1a2s3d4f5g6h7j8k9l0',
      },
    });
  });
});
