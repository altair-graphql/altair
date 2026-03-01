import { KeysPipe } from './keys.pipe';

describe('KeysPipe', () => {
  let pipe: KeysPipe;

  beforeEach(() => {
    pipe = new KeysPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should convert object to key-value list', () => {
    const obj = { key1: 'value1', key2: 'value2' };
    const result = pipe.transform(obj);
    expect(result).toEqual([
      { key: 'key1', value: 'value1' },
      { key: 'key2', value: 'value2' },
    ]);
  });

  it('should handle empty object', () => {
    const result = pipe.transform({});
    expect(result).toEqual([]);
  });

  it('should only include string values', () => {
    const obj: any = {
      stringVal: 'hello',
      numberVal: 42,
      booleanVal: true,
    };
    const result = pipe.transform(obj);
    expect(result).toEqual([{ key: 'stringVal', value: 'hello' }]);
  });

  it('should handle object with all string values', () => {
    const obj: any = {
      a: '1',
      b: '2',
      c: '3',
    };
    const result = pipe.transform(obj);
    expect(result.length).toBe(3);
  });
});
