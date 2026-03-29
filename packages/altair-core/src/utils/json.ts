import JSONBigint from 'json-bigint';
/**
 * Parses a JSON string into an object. Has support for BigInt and falls back to a default value if parsing fails.
 */
export const parseJson = <R = Record<string, unknown>, T = unknown>(
  str: string,
  { defaultValue = {} }: { defaultValue?: unknown } = {}
) => {
  try {
    return JSONBigint.parse(str) as R;
  } catch {
    console.warn('Could not parse JSON. Using default instead.');
    return defaultValue as T;
  }
};
