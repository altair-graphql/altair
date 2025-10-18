export async function tryCatch<T>(
  fn: () => Promise<T> | T
): Promise<[T | null, unknown]> {
  try {
    const result = await fn();
    return [result, null];
  } catch (error) {
    return [null, error];
  }
}
