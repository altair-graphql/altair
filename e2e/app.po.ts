import { browser, element, by } from 'protractor';

export class AltairPage {
  constructor() {
    browser.waitForAngularEnabled(false);
  }
  navigateTo() {
    return browser.get('/');
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
