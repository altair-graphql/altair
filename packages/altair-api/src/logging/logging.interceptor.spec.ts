import { describe, expect, it } from 'vitest';
import { loggingMiddleware } from './logging.middleware';

describe('loggingMiddleware', () => {
  it('should be defined', () => {
    expect(loggingMiddleware).toBeDefined();
    expect(typeof loggingMiddleware).toBe('function');
  });
});
