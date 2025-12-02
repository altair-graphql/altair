import { describe, expect, it } from '@jest/globals';
import { setByDotNotation } from './dot-notation';

describe('setByDotNotation', () => {
  it('should correctly set value by dot notation', () => {
    const obj: any = {};
    const existingObj = { a: 1, b: { c: 2 } };

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

    // set new object inside existing object
    setByDotNotation(existingObj, 'b.e.f', 9);
    expect(existingObj).toEqual({ a: 1, b: { c: 2, e: { f: 9 } } });

    // set object inside existing object
    setByDotNotation(existingObj, 'b.e', { g: 10 });
    expect(existingObj).toEqual({ a: 1, b: { c: 2, e: { g: 10 } } });

    // set object inside existing object with merge
    setByDotNotation(existingObj, 'b.e', { h: 11 }, true);
    expect(existingObj).toEqual({ a: 1, b: { c: 2, e: { g: 10, h: 11 } } });

    // prevent prototype pollution
    const polluted: any = {};
    setByDotNotation(polluted, '__proto__.polluted', 'polluted');
    expect((polluted as any).polluted).toBeUndefined();
    expect(({} as any).polluted).toBeUndefined();

    setByDotNotation(polluted, 'constructor.prototype.polluted', 'polluted');
    expect((polluted as any).polluted).toBeUndefined();
    expect(({} as any).polluted).toBeUndefined();

    // ensure valid paths with substrings are not blocked
    const validObj: any = {};
    setByDotNotation(validObj, 'myconstructor', 'is-ok');
    expect(validObj.myconstructor).toBe('is-ok');

    setByDotNotation(validObj, 'some_prototype_value', 'is-ok');
    expect(validObj.some_prototype_value).toBe('is-ok');
  });
});
