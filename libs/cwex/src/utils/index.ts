import { createRequire } from 'node:module';
import { Options, globby } from 'globby';

export const getFiles = async (patterns: string[], opts: Options = {}) => {
  return globby(patterns, opts);
};

const requreResolve = createRequire(import.meta.url).resolve;

export const getResolvedModule = (
  modulePath: string,
  { resolver = requreResolve } = {}
) => {
  try {
    return resolver(modulePath);
  } catch (err) {
    return '';
  }
};

export const getResolvedTargetModule = (
  target: string,
  { resolver = requreResolve } = {}
) => {
  return getResolvedModule(`../targets/${target}`, { resolver });
};
