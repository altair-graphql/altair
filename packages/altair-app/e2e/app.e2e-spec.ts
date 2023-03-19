import { test, expect } from '@playwright/test';
import { AltairPage } from './app.po';

test.describe('altair App', () => {
  test('should have at lease one window', async ({ page }) => {
    const altairPage = new AltairPage(page);
    await altairPage.navigateTo();

    expect(await altairPage.getWindows()).toBeVisible();
  });
});
