import { describe, it, expect } from 'vitest';
import { z } from 'zod/v4';
import { stripDefaults } from './schema';

describe('stripDefaults', () => {
  it('should strip default values from a Zod object schema', () => {
    const schema = z.object({
      a: z.string().default('defaultA'),
      b: z.number(),
      c: z.boolean().default(true),
    });

    const strippedSchema = stripDefaults(schema);

    const parsed = schema.parse({ b: 42 });
    expect(parsed).toEqual({ a: 'defaultA', b: 42, c: true });
    expect(() => strippedSchema.parse({ b: 42 })).toThrow();
  });

  it('should handle schemas without defaults', () => {
    const schema = z.object({
      x: z.string(),
      y: z.number(),
    });

    const strippedSchema = stripDefaults(schema);

    const parsed = strippedSchema.parse({ x: 'test', y: 10 });
    expect(parsed).toEqual({ x: 'test', y: 10 });
  });

  it('should throw an error for invalid data', () => {
    const schema = z.object({
      a: z.string().default('defaultA'),
      b: z.number(),
    });

    const strippedSchema = stripDefaults(schema);

    expect(() => strippedSchema.parse({ a: 'test' })).toThrow();
  });
});
