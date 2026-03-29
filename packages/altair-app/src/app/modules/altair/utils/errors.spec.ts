import { getErrorResponse, getApiErrorCode } from './errors';

describe('getErrorResponse', () => {
  it('should return error for non-HTTPError', async () => {
    const error = new Error('test error');
    const result = await getErrorResponse(error);
    expect(result).toBe(error);
  });

  it('should return JSON response for HTTPError', async () => {
    const mockJson = () => Promise.resolve({ message: 'error' });
    const error = {
      name: 'HTTPError',
      response: { json: mockJson },
    } as any;
    const result = await getErrorResponse(error);
    expect(result).toEqual({ message: 'error' });
  });

  it('should return error object if it has name property but is not HTTPError', async () => {
    const error = { name: 'OtherError', message: 'test' };
    const result = await getErrorResponse(error as unknown as any);
    expect(result).toEqual(error);
  });

  it('should return error if response is missing from HTTPError', async () => {
    const error = { name: 'HTTPError' };
    const result = await getErrorResponse(error);
    expect(result).toEqual(error);
  });

  it('should return null/undefined as is', async () => {
    expect(await getErrorResponse(null)).toBeNull();
    expect(await getErrorResponse(undefined)).toBeUndefined();
  });
});

describe('getApiErrorCode', () => {
  it('should return undefined for null/undefined', () => {
    expect(getApiErrorCode(null)).toBeUndefined();
    expect(getApiErrorCode(undefined)).toBeUndefined();
  });

  it('should return undefined for non-object error', () => {
    expect(getApiErrorCode('string')).toBeUndefined();
    expect(getApiErrorCode(123)).toBeUndefined();
  });

  it('should return undefined if error does not have error property', () => {
    expect(getApiErrorCode({ message: 'test' })).toBeUndefined();
  });

  it('should return undefined if error.error is not an object', () => {
    expect(getApiErrorCode({ error: 'string' })).toBeUndefined();
  });

  it('should return undefined if error.error does not have code', () => {
    expect(getApiErrorCode({ error: { message: 'test' } })).toBeUndefined();
  });

  it('should return undefined if error.error.code is not a string', () => {
    expect(getApiErrorCode({ error: { code: 123 } })).toBeUndefined();
  });

  it('should return error code string when valid', () => {
    const error = { error: { code: 'AUTH_ERROR', message: 'Unauthorized' } };
    expect(getApiErrorCode(error)).toBe('AUTH_ERROR');
  });
});
