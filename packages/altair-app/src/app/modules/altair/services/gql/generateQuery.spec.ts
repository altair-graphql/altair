import fs from 'fs';
import path from 'path';
import { describe, it, expect } from '@jest/globals';
import { buildSchema } from 'graphql';
import { generateQuery } from './generateQuery';

const getTestSchema = () => {
  const sdl = fs.readFileSync(
    path.resolve(__dirname, '../../../../../../fixtures/test.sdl'),
    'utf8'
  );
  return buildSchema(sdl);
};

describe('generateQuery', () => {
  describe('query', () => {
    it('returns empty string if parent type is invalid', async () => {
      const schema = getTestSchema();
      const res = await generateQuery(schema, 'GOTHouses', 'Invalid', {});
      expect(res.generated).toBe('');
    });
    it('returns empty string if field is invalid', async () => {
      const schema = getTestSchema();
      const res = await generateQuery(schema, 'invalid', 'Query', {});
      expect(res.generated).toBe('');
    });
    it('generates expected query', async () => {
      const schema = getTestSchema();
      const res = await generateQuery(schema, 'GOTHouses', 'Query', {});
      expect(res.generated).toMatchSnapshot();
    });
    it('generates expected query with specified max depth', async () => {
      const schema = getTestSchema();
      const res = await generateQuery(schema, 'GOTHouses', 'Query', {
        maxDepth: 5,
      });
      expect(res.generated).toMatchSnapshot();
    });
    it('generates expected query with specified tab size', async () => {
      const schema = getTestSchema();
      const res = await generateQuery(schema, 'GOTHouses', 'Query', {
        tabSize: 5,
      });
      expect(res.generated).toMatchSnapshot();
    });
    it('generates expected query with default string argument', async () => {
      const schema = getTestSchema();
      const res = await generateQuery(schema, 'GOTBooks', 'Query', {
        maxDepth: 2,
      });
      expect(res.generated).toMatchSnapshot();
    });
    it('generates expected query with default enum argument', async () => {
      const schema = getTestSchema();
      const res = await generateQuery(schema, 'files', 'Query', {
        maxDepth: 2,
      });
      expect(res.generated).toMatchSnapshot();
    });
    it('generates expected query with string argument', async () => {
      const schema = getTestSchema();
      const res = await generateQuery(schema, 'withString', 'Query', {
        maxDepth: 2,
      });
      expect(res.generated).toMatchSnapshot();
    });
    it('generates expected query with int argument', async () => {
      const schema = getTestSchema();
      const res = await generateQuery(schema, 'withInt', 'Query', {
        maxDepth: 2,
      });
      expect(res.generated).toMatchSnapshot();
    });
    it('generates expected query with boolean argument', async () => {
      const schema = getTestSchema();
      const res = await generateQuery(schema, 'withBoolean', 'Query', {
        maxDepth: 2,
      });
      expect(res.generated).toMatchSnapshot();
    });
    it('generates expected query with enum argument', async () => {
      const schema = getTestSchema();
      const res = await generateQuery(schema, 'withEnum', 'Query', {
        maxDepth: 2,
      });
      expect(res.generated).toMatchSnapshot();
    });
    it('generates expected query with list argument', async () => {
      const schema = getTestSchema();
      const res = await generateQuery(schema, 'withStringList', 'Query', {
        maxDepth: 2,
      });
      expect(res.generated).toMatchSnapshot();
    });
    it('generates expected query with object argument', async () => {
      const schema = getTestSchema();
      const res = await generateQuery(schema, 'withGOTCharacter', 'Query', {
        maxDepth: 2,
      });
      expect(res.generated).toMatchSnapshot();
    });
    it('generates expected query with multiple complex arguments', async () => {
      const schema = getTestSchema();
      const res = await generateQuery(
        schema,
        'withMultipleListArguments',
        'Query',
        { maxDepth: 2 }
      );
      expect(res.generated).toMatchSnapshot();
    });
  });

  describe('fragment', () => {
    it('generates expected fragment', async () => {
      const schema = getTestSchema();

      const res = await generateQuery(schema, 'overlord', 'GOTHouse', {});
      expect(res.generated).toMatchSnapshot();
    });
    it('generates expected fragment with specified max depth', async () => {
      const schema = getTestSchema();

      const res = await generateQuery(schema, 'overlord', 'GOTHouse', {
        maxDepth: 5,
      });
      expect(res.generated).toMatchSnapshot();
    });
    it('generates expected fragment with specified tab size', async () => {
      const schema = getTestSchema();

      const res = await generateQuery(schema, 'overlord', 'GOTHouse', {
        tabSize: 5,
      });
      expect(res.generated).toMatchSnapshot();
    });
  });
});
