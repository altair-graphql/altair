import { TruncatePipe } from './truncate.pipe';

describe('TruncatePipe', () => {
  let pipe: TruncatePipe;

  beforeEach(() => {
    pipe = new TruncatePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should truncate text longer than default length', () => {
    const longText =
      'This is a very long text that should be truncated because it exceeds the default length limit';
    const result = pipe.transform(longText);
    expect(result.length).toBeLessThan(longText.length);
    expect(result.endsWith('...')).toBe(true);
  });

  it('should truncate text with custom length', () => {
    const longText = 'This is a very long text';
    const result = pipe.transform(longText, 10);
    expect(result).toBe('This is a ...');
  });

  it('should truncate text with custom symbol', () => {
    const longText = 'This is a very long text';
    const result = pipe.transform(longText, 10, '>>>');
    expect(result).toBe('This is a >>>');
  });

  it('should not truncate text shorter than max length', () => {
    const shortText = 'Short text';
    const result = pipe.transform(shortText);
    expect(result).toBe(shortText);
  });

  it('should handle empty string', () => {
    const result = pipe.transform('');
    expect(result).toBe('');
  });
});
