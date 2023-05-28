import { ConsoleLogger } from '@nestjs/common';
import { NewrelicInterceptor } from './newrelic.interceptor';

describe('NewrelicInterceptor', () => {
  it('should be defined', () => {
    const logger = new ConsoleLogger();
    expect(new NewrelicInterceptor(logger)).toBeDefined();
  });
});
