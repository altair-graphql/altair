import { Page } from '@playwright/test';

export class AltairPage {
  constructor(private page: Page) {}
  async navigateTo() {
    await this.page.goto('/');
    await this.page.waitForSelector('app-window');
  }

  getParagraphText() {
    return this.page.locator('app-root h1').textContent();
  }

  getWindows() {
    return this.page.locator('app-window');
  }

  title() {
    return this.page.title();
  }
}
