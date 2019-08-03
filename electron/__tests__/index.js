const Application = require('spectron').Application;
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const assert = chai.assert;
const path = require('path');

let electronPath = path.join(__dirname, '../../node_modules', '.bin', 'electron');
const appPath = path.join(__dirname, '../main');
if (process.platform === 'win32') {
  electronPath += '.cmd';
}
const app = new Application({
  path: electronPath,
  args: [appPath],
  env: {
    ELECTRON_ENABLE_LOGGING: true,
    ELECTRON_ENABLE_STACK_DUMPING: true,
    NODE_ENV: 'test'
  },
  startTimeout: 20000,
  requireName: 'electronRequire',
});

const selectors = {
  windowSwitcherSelector: '.window-switcher:not(.window-switcher--new-window)',
  visibleWindowSelector: 'app-window:not(.hide)',
};

global.before(function() {
  chai.should();
  chai.use(chaiAsPromised);
});
describe('Altair electron', function() {
  this.timeout(20000);
  beforeEach(async function() {
    this.timeout(20000);
    await app.start();

    app.client.addCommand('newAltairWindow', async() => {
      const elements = await app.client.$$(selectors.windowSwitcherSelector);
      app.client.$('.window-switcher--new-window').click();
      await app.client.pause(500);
      const addedElements = await app.client.$$(selectors.windowSwitcherSelector);
      assert.strictEqual(addedElements.length, elements.length + 1, 'New window was not created.');
    });
    app.client.addCommand('closeLastAltairWindow', async() => {
      const elements = await app.client.$$(selectors.windowSwitcherSelector);
      app.client.$(`${selectors.windowSwitcherSelector}:nth-last-child(2) .window-switcher__close`).click();
      await app.client.pause(500);
      const removedElements = await app.client.$$(selectors.windowSwitcherSelector);
      assert.strictEqual(removedElements.length, elements.length - 1, 'Window was not closed.');
    });
    app.client.addCommand('setTestServerQraphQLUrl', async() => {
      await app.client.$(`${selectors.visibleWindowSelector} .url-box__input input`).setValue('http://localhost:5400/graphql');
    });

    await app.client.pause(500);
  });
  afterEach(() => app.stop());

  it('load window successfully', () => {
    return app.browserWindow.isVisible().should.eventually.equal(true);
  });

  it('can create window and close window', async() => {
    await app.client.newAltairWindow();
    await app.client.closeLastAltairWindow();
  });

  it('can set URL and see docs loaded automatically', async() => {
    await app.client.newAltairWindow();
    await app.client.setTestServerQraphQLUrl();
    app.client.$(`${selectors.visibleWindowSelector} .url-box__input-btn[track-id="show_docs"]`).click();
    await app.client.pause(100);
    const isDocVisible = await app.client.$(`${selectors.visibleWindowSelector} .app-doc-viewer`).isVisible();
    assert.isTrue(isDocVisible);
    await app.client.closeLastAltairWindow();
  });

  it('can send a request and receive response from server', async() => {
    await app.client.newAltairWindow();
    await app.client.setTestServerQraphQLUrl();

    app.client.$(`${selectors.visibleWindowSelector} .query-editor__input .CodeMirror-scroll`).click();
    await app.client.pause(100);
    await app.client.keys(`
    { hello }`);
    app.client.$(`${selectors.visibleWindowSelector} .url-box__button--send`).click();
    await app.client.pause(1000);
    const result = await app.client.$(`${selectors.visibleWindowSelector} app-query-result .app-result .CodeMirror`).getText();
    assert.include(result, 'Hello world');
    await app.client.closeLastAltairWindow();
  });
});
