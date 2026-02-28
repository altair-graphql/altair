import { DefaultPipe } from './default.pipe';

describe('DefaultPipe', () => {
  let pipe: DefaultPipe;

  beforeEach(() => {
    pipe = new DefaultPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return value if not null or undefined', () => {
    expect(pipe.transform('hello', 'default' as any)).toBe('hello');
    expect(pipe.transform(0, 'default' as any)).toBe(0);
    expect(pipe.transform(false, 'default' as any)).toBe(false);
    expect(pipe.transform('', 'default' as any)).toBe('');
  });

  it('should return default value if value is null', () => {
    expect(pipe.transform(null, 'default')).toBe('default');
    expect(pipe.transform(null, 0 as any)).toBe(0);
    expect(pipe.transform(null, false as any)).toBe(false);
  });

  it('should return default value if value is undefined', () => {
    expect(pipe.transform(undefined, 'default')).toBe('default');
    expect(pipe.transform(undefined, 0 as any)).toBe(0);
    expect(pipe.transform(undefined, false as any)).toBe(false);
  });

  it('should return undefined if value is null and no default provided', () => {
    expect(pipe.transform(null)).toBeUndefined();
  });

  it('should return undefined if value is undefined and no default provided', () => {
    expect(pipe.transform(undefined)).toBeUndefined();
  });

  it('should handle objects', () => {
    const obj = { key: 'value' };
    expect(pipe.transform(obj, {} as any)).toBe(obj);
    expect(pipe.transform(null, {})).toEqual({});
  });

  it('should handle arrays', () => {
    const arr = [1, 2, 3];
    expect(pipe.transform(arr, [] as any)).toBe(arr);
    expect(pipe.transform(null, [])).toEqual([]);
  });
});
