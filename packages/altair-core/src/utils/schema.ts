import { z } from 'zod/v4';

/**
 * This function strips default values from a Zod object schema, returning a new schema
 * that does not include any default values. This is useful when you want to
 * validate data without applying defaults.
 *
 * NOTE: This function only strips top-level defaults and does not handle nested schemas.
 * @param schema
 * @returns
 */
export function stripDefaults<T extends z.core.$ZodShape>(schema: z.ZodObject<T>) {
  const shape = schema.shape;
  const newShape: Record<string, z.core.$ZodType | undefined> = {};

  Object.entries(shape).forEach(([key, value]) => {
    // Remove default if present
    const newValue = value instanceof z.ZodDefault ? value.def.innerType : value;
    newShape[key] = newValue;
  });

  return z.object(
    newShape as unknown as {
      [K in keyof T]: T[K] extends z.ZodDefault<infer Inner> ? Inner : T[K];
    }
  );
}
