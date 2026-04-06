import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';
import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { AllExceptionsFilter } from './all-exceptions.filter';

const { mockLoggerError, mockLoggerWarn } = vi.hoisted(() => ({
  mockLoggerError: vi.fn(),
  mockLoggerWarn: vi.fn(),
}));

// Stub LogTape so the filter can call getLogger() without full LogTape setup.
vi.mock('@logtape/logtape', () => ({
  getLogger: () => ({
    error: mockLoggerError,
    warn: mockLoggerWarn,
    info: vi.fn(),
    debug: vi.fn(),
  }),
}));

function createMockHost() {
  const mockResponse = {};
  const mockRequest = {};
  return {
    host: {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost,
    mockResponse,
  };
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockReply: MockInstance;
  let mockGetRequestMethod: MockInstance;
  let mockGetRequestUrl: MockInstance;

  beforeEach(() => {
    mockReply = vi.fn();
    mockGetRequestMethod = vi.fn();
    mockGetRequestUrl = vi.fn();
    mockLoggerError.mockClear();
    mockLoggerWarn.mockClear();

    const httpAdapterHost = {
      httpAdapter: {
        reply: mockReply,
        getRequestMethod: mockGetRequestMethod,
        getRequestUrl: mockGetRequestUrl,
      },
    } as unknown as HttpAdapterHost;

    filter = new AllExceptionsFilter(httpAdapterHost);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('HttpException handling', () => {
    it('should return the original response for a 4xx HttpException', () => {
      const { host, mockResponse } = createMockHost();
      const exception = new NotFoundException('Resource not found');
      mockGetRequestMethod.mockReturnValue('GET');
      mockGetRequestUrl.mockReturnValue('/test');

      filter.catch(exception, host);

      expect(mockReply).toHaveBeenCalledWith(
        mockResponse,
        exception.getResponse(),
        HttpStatus.NOT_FOUND
      );
    });

    it('should log at warn level for 4xx errors', () => {
      const { host } = createMockHost();
      const exception = new BadRequestException('Invalid input');
      mockGetRequestMethod.mockReturnValue('POST');
      mockGetRequestUrl.mockReturnValue('/users');

      filter.catch(exception, host);

      expect(mockLoggerWarn).toHaveBeenCalledTimes(1);
      expect(mockLoggerWarn).toHaveBeenCalledWith(
        'HTTP exception: {method} {url} {status}',
        expect.objectContaining({
          method: 'POST',
          url: '/users',
          status: 400,
        })
      );
      expect(mockLoggerError).not.toHaveBeenCalled();
    });

    it('should log at error level for 5xx HttpExceptions', () => {
      const { host } = createMockHost();
      const exception = new InternalServerErrorException('Something broke');
      mockGetRequestMethod.mockReturnValue('GET');
      mockGetRequestUrl.mockReturnValue('/health');

      filter.catch(exception, host);

      expect(mockLoggerError).toHaveBeenCalledTimes(1);
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Unhandled server error: {method} {url} {status}',
        expect.objectContaining({
          method: 'GET',
          url: '/health',
          status: 500,
          error: exception,
          stack: exception.stack,
        })
      );
      expect(mockLoggerWarn).not.toHaveBeenCalled();
    });

    it('should preserve the original HttpException response body', () => {
      const { host, mockResponse } = createMockHost();
      const body = { statusCode: 403, message: 'Forbidden', custom: 'data' };
      const exception = new HttpException(body, HttpStatus.FORBIDDEN);
      mockGetRequestMethod.mockReturnValue('DELETE');
      mockGetRequestUrl.mockReturnValue('/admin');

      filter.catch(exception, host);

      expect(mockReply).toHaveBeenCalledWith(mockResponse, body, 403);
    });
  });

  describe('unknown exception handling', () => {
    it('should return a generic 500 for a plain Error', () => {
      const { host, mockResponse } = createMockHost();
      const exception = new Error('Something unexpected');
      mockGetRequestMethod.mockReturnValue('GET');
      mockGetRequestUrl.mockReturnValue('/api');

      filter.catch(exception, host);

      expect(mockReply).toHaveBeenCalledWith(
        mockResponse,
        { statusCode: 500, message: 'Internal server error' },
        500
      );
    });

    it('should log the full error with stack trace for plain Errors', () => {
      const { host } = createMockHost();
      const exception = new Error('DB connection lost');
      mockGetRequestMethod.mockReturnValue('GET');
      mockGetRequestUrl.mockReturnValue('/data');

      filter.catch(exception, host);

      expect(mockLoggerError).toHaveBeenCalledTimes(1);
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Unexpected exception: {method} {url} {status}',
        expect.objectContaining({
          method: 'GET',
          url: '/data',
          status: 500,
          error: exception,
          stack: exception.stack,
        })
      );
    });

    it('should not leak internal error details in the response', () => {
      const { host } = createMockHost();
      const exception = new Error('secret database password exposed');
      mockGetRequestMethod.mockReturnValue('GET');
      mockGetRequestUrl.mockReturnValue('/api');

      filter.catch(exception, host);

      const responseBody = mockReply.mock.calls[0]![1];
      expect(responseBody.message).toBe('Internal server error');
      expect(JSON.stringify(responseBody)).not.toContain('secret');
    });

    it('should handle non-Error thrown values (string)', () => {
      const { host, mockResponse } = createMockHost();
      mockGetRequestMethod.mockReturnValue('GET');
      mockGetRequestUrl.mockReturnValue('/api');

      filter.catch('something went wrong', host);

      expect(mockReply).toHaveBeenCalledWith(
        mockResponse,
        { statusCode: 500, message: 'Internal server error' },
        500
      );
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Unexpected exception: {method} {url} {status}',
        expect.objectContaining({
          raw: 'something went wrong',
          error: undefined,
          stack: undefined,
        })
      );
    });

    it('should handle non-Error thrown values (null)', () => {
      const { host, mockResponse } = createMockHost();
      mockGetRequestMethod.mockReturnValue('GET');
      mockGetRequestUrl.mockReturnValue('/api');

      filter.catch(null, host);

      expect(mockReply).toHaveBeenCalledWith(
        mockResponse,
        { statusCode: 500, message: 'Internal server error' },
        500
      );
    });
  });
});
