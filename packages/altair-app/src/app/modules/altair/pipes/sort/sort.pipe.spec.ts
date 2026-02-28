import { SortPipe } from './sort.pipe';

describe('SortPipe', () => {
  let pipe: SortPipe;

  beforeEach(() => {
    pipe = new SortPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should sort array of strings', () => {
    const list: any = ['banana', 'apple', 'cherry'];
    const result = pipe.transform(list);
    expect(result).toEqual(['apple', 'banana', 'cherry']);
  });

  it('should sort array by key', () => {
    const list: any = [{ name: 'banana' }, { name: 'apple' }, { name: 'cherry' }];
    const result = pipe.transform(list, 'name');
    expect(result).toEqual([
      { name: 'apple' },
      { name: 'banana' },
      { name: 'cherry' },
    ]);
  });

  it('should sort by key case-insensitively', () => {
    const list: any = [{ name: 'Banana' }, { name: 'apple' }, { name: 'Cherry' }];
    const result = pipe.transform(list, 'name');
    expect(result).toEqual([
      { name: 'apple' },
      { name: 'Banana' },
      { name: 'Cherry' },
    ]);
  });

  it('should not mutate original array', () => {
    const original: any = ['banana', 'apple', 'cherry'];
    const copy = [...original];
    pipe.transform(original);
    expect(original).toEqual(copy);
  });

  it('should return input if not an array', () => {
    const notArray = 'not an array';
    const result = pipe.transform(notArray as any);
    expect(result).toBe(notArray);
  });

  it('should return input if array is null/undefined', () => {
    expect(pipe.transform(null as any)).toBeNull();
    expect(pipe.transform(undefined as any)).toBeUndefined();
  });

  it('should handle empty array', () => {
    const result = pipe.transform([]);
    expect(result).toEqual([]);
  });

  it('should handle array with non-string key values (returns 0)', () => {
    const list: any = [
      { name: 'banana', order: 2 },
      { name: 'apple', order: 1 },
    ];
    const result = pipe.transform(list, 'order');
    expect((result[0] as any).name).toBe('banana');
    expect((result[1] as any).name).toBe('apple');
  });

  it('should keep original order for undefined key values', () => {
    const list: any = [{ name: 'banana' }, { name: 'apple' }];
    const result = pipe.transform(list, 'missingKey');
    expect(result).toEqual([{ name: 'banana' }, { name: 'apple' }]);
  });
});
