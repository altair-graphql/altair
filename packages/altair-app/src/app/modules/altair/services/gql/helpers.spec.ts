import { buildSchema, parse, print } from 'graphql';
import { describe, expect, it } from 'vitest';

import { refactorArgumentsToVariables } from './helpers';

describe('refactorArgumentsToVariables', () => {
  it('preserves list and non-null wrappers in generated variable types', () => {
    const schema = buildSchema(`
      type Query {
        search(filters: [String!]!): String
      }
    `);
    const document = parse('{ search(filters: ["active"]) }');

    const result = refactorArgumentsToVariables(document, schema);

    expect(print(result.document)).toContain('$filters: [String!]!');
    expect(result.variables).toEqual({ filters: ['active'] });
  });
});
