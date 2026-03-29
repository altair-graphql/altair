import {
  getFullUrl,
  setByDotNotation,
  truncateText,
  isValidUrl,
  jsonc,
  parseJson,
  mapToKeyValueList,
  str,
  capitalize,
  parseDotNotationKey,
} from '.';

vi.mock('file-saver', () => ({ saveAs: vi.fn() }));

describe('utils', () => {
  it('should correctly set value by dot notation', () => {
    const obj: any = {};

    // set to empty path
    setByDotNotation(obj, 'a.b', 3);
    expect(obj).toEqual({ a: { b: 3 } });

    // set to existing object in path
    setByDotNotation(obj, 'a.c', 4);
    expect(obj).toEqual({ a: { b: 3, c: 4 } });

    // set to new array
    setByDotNotation(obj, 'a.d.1', 5);
    expect(obj).toEqual({ a: { b: 3, c: 4, d: [undefined, 5] } });

    // set to existing array
    setByDotNotation(obj, 'a.d.0', 6);
    expect(obj).toEqual({ a: { b: 3, c: 4, d: [6, 5] } });

    // set existing value
    setByDotNotation(obj, 'a.c', 7);
    expect(obj).toEqual({ a: { b: 3, c: 7, d: [6, 5] } });

    // set new object inside array
    setByDotNotation(obj, 'a.d.2.x', 8);
    expect(obj).toEqual({ a: { b: 3, c: 7, d: [6, 5, { x: 8 }] } });
  });

  describe('.truncateText', () => {
    it('should truncate long texts and append ellipsis', () => {
      const longText = `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrnged.`;
      const result = truncateText(longText);
      expect(result).toBe(
        'Lorem Ipsum is simply dummy text of the printing and typesetting indus...'
      );
    });
    it('should truncate texts longer than provided max length', () => {
      const longText = `Lorem Ipsum is simply dummy text.`;
      const result = truncateText(longText, 10);
      expect(result).toBe('Lorem Ipsu...');
    });
    it('should keep short texts unchanged', () => {
      const longText = `Lorem Ipsum is simply dummy text.`;
      const result = truncateText(longText, 70);
      expect(result).toBe('Lorem Ipsum is simply dummy text.');
    });
  });

  describe('.getFullUrl', () => {
    it('should not change the value when including env variable', () => {
      const envVariable = '{{endpointUrl}}';
      const result = getFullUrl(envVariable);
      expect(result).toBe(envVariable);
    });
    it('should not change the value for a valid absolute url', () => {
      const url = 'https://test.com/graphql';
      const result = getFullUrl(url);
      expect(result).toBe(url);
    });
    it('should prepend text with origin location', () => {
      const endpoint = 'graphql';
      const result = getFullUrl(endpoint);
      expect(result).toBe(location.origin + '/' + endpoint);
    });
    it('should use specified protocol', () => {
      const endpoint = 'graphql';
      const result = getFullUrl(endpoint, 'wss');
      expect(result).toBe('wss://' + location.host + '/' + endpoint);
    });
    it('should return empty string for empty url', () => {
      expect(getFullUrl('')).toBe('');
    });
    it('should return location.href for wildcard url', () => {
      expect(getFullUrl('*')).toBe(location.href);
    });
  });

  describe('.isValidUrl', () => {
    it('should return true for a valid URL', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
    });
    it('should return false for an invalid URL', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
    });
    it('should return false for empty string', () => {
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('.jsonc', () => {
    it('should parse JSON without comments', () => {
      expect(jsonc('{"a":1}')).toEqual({ a: 1 });
    });
    it('should strip single-line comments', () => {
      expect(jsonc('{"a":1} // comment')).toEqual({ a: 1 });
    });
    it('should return empty object for empty string', () => {
      expect(jsonc('')).toEqual({});
    });
    it('should return empty object for whitespace only string', () => {
      expect(jsonc('   ')).toEqual({});
    });
  });

  describe('.parseJson', () => {
    it('should parse valid JSON', () => {
      expect(parseJson('{"a":1}')).toEqual({ a: 1 });
    });
    it('should return default value for invalid JSON', () => {
      expect(parseJson('not-json')).toEqual({});
    });
    it('should return provided default value on failure', () => {
      expect(parseJson('bad', null)).toBeNull();
    });
    it('should handle big integers', () => {
      const result = parseJson('{"id":9007199254740993}');
      expect(result).toBeTruthy();
    });
  });

  describe('.mapToKeyValueList', () => {
    it('should convert an object to key-value pairs', () => {
      const result = mapToKeyValueList({ a: 'x', b: 'y' });
      expect(result).toEqual([
        { key: 'a', value: 'x' },
        { key: 'b', value: 'y' },
      ]);
    });
    it('should filter out non-string values', () => {
      const result = mapToKeyValueList({ a: 'x', b: 123 as any });
      expect(result).toEqual([{ key: 'a', value: 'x' }]);
    });
    it('should filter out empty keys', () => {
      const result = mapToKeyValueList({ '': 'x', a: 'y' });
      expect(result).toEqual([{ key: 'a', value: 'y' }]);
    });
  });

  describe('.str', () => {
    it('should return string as-is', () => {
      expect(str('hello')).toBe('hello');
    });
    it('should convert number to string', () => {
      expect(str(42)).toBe('42');
    });
    it('should return undefined for undefined', () => {
      expect(str(undefined)).toBeUndefined();
    });
    it('should return undefined for null', () => {
      expect(str(null)).toBeUndefined();
    });
  });

  describe('.capitalize', () => {
    it('should capitalize the first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
    });
    it('should handle empty string', () => {
      expect(capitalize('')).toBe('');
    });
    it('should handle already capitalized string', () => {
      expect(capitalize('World')).toBe('World');
    });
  });

  describe('.parseDotNotationKey', () => {
    it('should return integer for numeric string', () => {
      expect(parseDotNotationKey('0')).toBe(0);
      expect(parseDotNotationKey('3')).toBe(3);
    });
    it('should return original string for non-numeric key', () => {
      expect(parseDotNotationKey('abc')).toBe('abc');
    });
    // TODO: revisit handling of float keys - currently treated as non-numeric, but may want to consider parsing as nested integer keys instead (e.g. '1.5' => [1, 5])
    it.skip('should return original string for float key', () => {
      expect(parseDotNotationKey('1.5')).toBe('1.5');
    });
  });

  describe('.setByDotNotation edge cases', () => {
    it('should return undefined for empty path', () => {
      const obj: any = {};
      expect(setByDotNotation(obj, '', 1)).toBeUndefined();
    });
    it('should handle numeric path', () => {
      const obj: any = [0, 1, 2];
      setByDotNotation(obj, 0, 99);
      expect(obj[0]).toBe(99);
    });
  });
});
