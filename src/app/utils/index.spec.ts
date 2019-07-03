import { setByDotNotation } from '.';

describe('utils', () => {

    it('should correctly set value by dot notation', () => {

        const obj: any = {};

        // set to empty path
        setByDotNotation(obj, 'a.b', 3);
        expect(obj).toEqual({ a: { b: 3 }});

        // set to existing object in path
        setByDotNotation(obj, 'a.c', 4);
        expect(obj).toEqual({ a: { b: 3, c: 4 }});

        // set to new array
        setByDotNotation(obj, 'a.d.1', 5);
        expect(obj).toEqual({ a: { b: 3, c: 4, d: [undefined, 5] }})

        // set to existing array
        setByDotNotation(obj, 'a.d.0', 6);
        expect(obj).toEqual({ a: { b: 3, c: 4, d: [6, 5] }})

        // set existing value
        setByDotNotation(obj, 'a.c', 7);
        expect(obj).toEqual({ a: { b: 3, c: 7, d: [6, 5] }})

        // set new object inside array
        setByDotNotation(obj, 'a.d.2.x', 8);
        expect(obj).toEqual({ a: { b: 3, c: 7, d: [6, 5, { x: 8 }] }})
    })

})