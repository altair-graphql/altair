import { AltairPage } from './app.po';

describe('altair App', () => {
  let page: AltairPage;

  beforeEach(() => {
    page = new AltairPage();
  });

  it('should have at lease one window', async () => {
    await page.navigateTo();
    expect(await page.getWindows().isDisplayed()).toBe(true);
  });
});
