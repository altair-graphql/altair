const QUOTED_VALUES = [
  'self',
  'unsafe-inline',
  'unsafe-eval',
  'none',
  'strict-dynamic',
  'report-sample',
  'wasm-unsafe-eval',
];
const QUOTED_PREFIXES = ['sha256-', 'sha384-', 'sha512-', 'nonce-'];
export const cspAsString = (csp: Record<string, string[]>): string => {
  return Object.entries(csp)
    .map(([key, values]) => {
      const mappedValues = values.map((value) => {
        if (QUOTED_VALUES.includes(value)) {
          return `'${value}'`;
        }
        if (QUOTED_PREFIXES.some((prefix) => value.startsWith(prefix))) {
          return `'${value}'`;
        }
        return value;
      });
      return `${key} ${mappedValues.join(' ')}`;
    })
    .join('; ');
};
