const prefix = 'Invariant failed';

class InvariantError extends Error {
  framesToPop = 1;
}

export const invariant = (condition: any, message?: string) => {
  if (condition) {
    return;
  }

  const value = message ? `${prefix}: ${message}` : prefix;
  throw new InvariantError(value);
};
