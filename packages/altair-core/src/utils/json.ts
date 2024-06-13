import JSONBigint from 'json-bigint';
/**
 * Parses a JSON string into an object. Has support for BigInt and falls back to a default value if parsing fails.
 */
export const parseJson = <T = {}>(str: string, defaultValue: T = {} as T) => {
  try {
    return JSONBigint.parse(str) as Record<string, unknown>;
  } catch {
    console.error('Could not parse JSON. Using default instead.');
    return defaultValue;
  }
};
