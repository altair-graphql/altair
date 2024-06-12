import JSONBigint from 'json-bigint';
/**
 * Parses a JSON string into an object. Has support for BigInt and falls back to a default value if parsing fails.
 */
export const parseJson = (str: string, defaultValue: unknown = {}) => {
  try {
    return JSONBigint.parse(str);
  } catch {
    console.error('Could not parse JSON. Using default instead.');
    return defaultValue;
  }
};
