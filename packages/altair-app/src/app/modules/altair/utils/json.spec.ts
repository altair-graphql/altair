import { getValueBoundariesInStringifiedJson } from './json';

describe('getValueBoundariesInStringifiedJson', () => {
  it(`should return the boundaries of a numeric value`, () => {
    // GIVEN
    const json = `{\n  "theme": "system",\n  "language": "en-US",\n  "addQueryDepthLimit": 3,\n  "tabSize": 2\n}`;
    const key = 'addQueryDepthLimit';

    // WHEN
    const boundaries = getValueBoundariesInStringifiedJson(json, key);

    // THEN
    expect(boundaries.start).toBe(70);
    expect(boundaries.end).toBe(71);
  });

  it(`should return the boundaries of a string value`, () => {
    // GIVEN
    const json = `{\n  "theme": "system",\n  "language": "en-US",\n  "addQueryDepthLimit": 3,\n  "tabSize": 2\n}`;
    const key = 'language';

    // WHEN
    const boundaries = getValueBoundariesInStringifiedJson(json, key);

    // THEN
    expect(boundaries.start).toBe(37);
    expect(boundaries.end).toBe(44);
  });
});
