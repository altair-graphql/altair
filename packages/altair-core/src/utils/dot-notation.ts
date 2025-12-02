function parseDotNotationKey(key: string) {
  const intKey = parseInt(key, 10);
  return intKey.toString() === key ? intKey : key;
}

/**
 * Sets value to object using dot notation.
 * @param obj Object to set the value to.
 * @param path Path as a string, separated by dots.
 * @param value Any value to be set.
 * @example
 * ```ts
 * const obj = { a: 1, b: { c: 2 } };
 * setByDotNotation(obj, "b.d.e.0", 3);
 * // results in
 * { a: 1, b: { c: 2, d: { e: [3] } } };
 * ```
 */
export function setByDotNotation<TResult = unknown>(
  obj: Record<string, any>,
  path: Array<number | string> | number | string,
  value: TResult,
  merge = false
): TResult | undefined {
  if (typeof path === 'number') {
    path = [path];
  }
  if (!path || path.length === 0) {
    return undefined;
  }
  if (typeof path === 'string') {
    const segments = path.split('.').map(parseDotNotationKey);
    if (segments.some(segment => segment === '__proto__' || segment === 'constructor' || segment === 'prototype')) {
      return undefined;
    }
    return setByDotNotation(
      obj,
      segments,
      value,
      merge
    );
  }

  if (Array.isArray(path) && path.some(segment => segment === '__proto__' || segment === 'constructor' || segment === 'prototype')) {
    return undefined;
  }

  const currentPath = path[0];
  if (typeof currentPath === 'undefined') {
    return;
  }
  const currentValue = obj[currentPath];

  if (path.length === 1) {
    if (
      merge &&
      currentValue &&
      typeof currentValue === 'object' &&
      typeof value === 'object'
    ) {
      Object.assign(currentValue, value);
      return currentValue;
    }
    obj[currentPath] = value;
    return currentValue;
  }

  if (currentValue === undefined) {
    if (typeof path[1] === 'number') {
      obj[currentPath] = [];
    } else {
      obj[currentPath] = {};
    }
  }

  return setByDotNotation(obj[currentPath], path.slice(1), value, merge);
}
