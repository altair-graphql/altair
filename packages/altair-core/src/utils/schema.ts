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
