import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: 'packages/altair-app/e2e',
  testMatch: '**/*.e2e-spec.ts',
  webServer: {
    command: 'pnpm start:app',
    url: 'http://localhost:4200',
    timeout: 10 * 60 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:4200',
    headless: false,
  },
};

export default config;
