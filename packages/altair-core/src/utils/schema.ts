import { z } from 'zod/v4';

/**
 * This function validates the given data against the provided Zod schema, but without
 * applying any transformations or defaults defined in the schema. It ensures that only
 * the properties explicitly allowed by the schema are retained in the returned object.
 * @param data
 * @param schema
 * @returns
 */
export function looseValidate<T>(data: unknown, schema: z.ZodType<T>): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw result.error;
  }
  if (
    typeof result.data !== 'object' ||
    typeof data !== 'object' ||
    result.data === null ||
    data === null
  ) {
    return data as T;
  }
  const validKeys = Object.keys(result.data);
  const opts = Object.entries(data)
    .filter(([key]) => validKeys.includes(key))
    .reduce((acc, [key, value]) => {
      return { ...acc, [key]: value };
    }, {} as T);

  return opts;
}

// TODO: Write tests for this function
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

  Object.keys(shape).forEach((key) => {
    const value = shape[key];
    // Remove default if present
    if (value instanceof z.ZodDefault) {
      newShape[key] = value.def.innerType;
    } else {
      newShape[key] = value;
    }
  });

  return z.object(
    newShape as unknown as {
      [K in keyof T]: T[K] extends z.ZodDefault<infer Inner> ? Inner : T[K];
    }
  );
}
