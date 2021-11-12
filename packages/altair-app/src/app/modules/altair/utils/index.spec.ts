import { getFullUrl, setByDotNotation, truncateText } from '.';

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

    describe('.truncateText', () => {
        it('should truncate long texts and append ellipsis', () => {
            const longText = `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrnged.`;
            const result = truncateText(longText);
            expect(result).toBe('Lorem Ipsum is simply dummy text of the printing and typesetting indus...');
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
            expect(result).toBe(location.origin + "/" + endpoint);
        });
    })
})
