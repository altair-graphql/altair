import { runNgccJestProcessor } from './ngcc-jest-processor';

export default async () => {
  const ngJestConfig = (globalThis as any).ngJest;
  const tsconfig = ngJestConfig?.tsconfig;
  if (!ngJestConfig?.skipNgcc) {
    runNgccJestProcessor(tsconfig);
  }
};
