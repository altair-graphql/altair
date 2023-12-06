import { Position } from 'cm6-graphql';
import { ContextToken, getTokenAtPosition } from 'graphql-language-service';
import { fillAllFields } from './fillFields';
import { getTestSchema } from './test-helper';

const testQuery = `{
  hello
  GOTBooks {
  }
}`;
describe('fillAllFields', () => {
  it('generates expected query', () => {
    const schema = getTestSchema();
    const pos = new Position(2, 12);
    const token = getTokenAtPosition(testQuery, pos, 1);
    // expect(token).toBe('');
    const res = fillAllFields(schema, testQuery, pos, token, {
      maxDepth: 2,
    });
    expect(res).toMatchSnapshot();
  });
});
