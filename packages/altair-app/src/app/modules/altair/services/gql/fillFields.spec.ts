import { Position } from 'cm6-graphql';
import { ContextToken, getTokenAtPosition } from 'graphql-language-service';
import { fillAllFields } from './fillFields';
import { getTestSchema } from './test-helper';

const testQuery = `{
  hello
  GOTBooks {
  }
}`;

const testQueryWithArgument = `{
  withGOTCharacter(character: {  })
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

  it('generates fields for input object arguments', () => {
    const schema = getTestSchema();
    // Position cursor inside the character argument object braces
    const pos = new Position(1, 32);
    const token = getTokenAtPosition(testQueryWithArgument, pos, 1);
    const res = fillAllFields(schema, testQueryWithArgument, pos, token, {
      maxDepth: 2,
    });
    expect(res.result).toContain('id:');
    expect(res.result).toContain('book:');
  });
});
