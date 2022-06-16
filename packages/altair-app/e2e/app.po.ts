import { browser, element, by, ExpectedConditions } from 'protractor';

export class AltairPage {
  constructor() {
    browser.waitForAngularEnabled(false);
  }
  async navigateTo() {
    await browser.get('/');
    const EC = ExpectedConditions;
    await browser.wait(
      ExpectedConditions.elementToBeClickable(element(by.css('app-window'))),
      5000
    );
  }

  getParagraphText() {
    return element(by.css('app-root h1')).getText();
  }

  getWindows() {
    return element(by.css('app-window'));
  }

  title() {
    return browser.getTitle();
  }
}
