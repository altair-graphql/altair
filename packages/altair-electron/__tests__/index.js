const Application = require('spectron').Application;
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const assert = chai.assert;
const path = require('path');

chai.use(chaiAsPromised);

const TEST_TIMEOUT = 60000;

let electronPath = path.join(__dirname, '../node_modules', '.bin', 'electron');
const appPath = path.join(__dirname, '../');

if (process.platform === 'win32') {
  electronPath += '.cmd';
}
const app = new Application({
  path: electronPath,
  args: [ appPath ],
  env: {
    ELECTRON_ENABLE_LOGGING: true,
    ELECTRON_ENABLE_STACK_DUMPING: true,
    NODE_ENV: 'test'
  },
  startTimeout: TEST_TIMEOUT,
  requireName: 'electronRequire',

  // Uncomment this line to debug
  chromeDriverArgs: [ 'remote-debugging-port=' + Math.floor(Math.random() * (9999 - 9000) + 9000) ]
});

const selectors = {
  windowSwitcherSelector: '.window-switcher:not(.window-switcher--new-window)',
  visibleWindowSelector: 'app-window:not(.hide)',
};

const closeAnyOpenToast = async (app) => {
  const toastElResult = await app.client.$('.toast-close-button');
  if (toastElResult.value) {
    await app.client.$('.toast-close-button').click();
    await app.client.pause(500);
    await closeAnyOpenToast(app);
  }
};

global.before(function() {
  chai.should();
  chai.use(chaiAsPromised);
});
describe('Altair electron', function() {
  this.timeout(TEST_TIMEOUT);
  beforeEach(async function() {
    this.timeout(TEST_TIMEOUT);
    await app.start();

    await app.client.addCommand('newAltairWindow', async() => {
      const elements = await app.client.$$(selectors.windowSwitcherSelector);
      await app.client.$('.window-switcher--new-window').click();
      await app.client.pause(500);
      const addedElements = await app.client.$$(selectors.windowSwitcherSelector);
      assert.strictEqual(addedElements.length, elements.length + 1, 'New window was not created.');
    });
    await app.client.addCommand('closeLastAltairWindow', async() => {
      const elements = await app.client.$$(selectors.windowSwitcherSelector);
      await closeAnyOpenToast(app);

      // await app.client.$(`${selectors.windowSwitcherSelector}:nth-last-child(2)`).click();
      // await app.client.windowByIndex(0);
      // await app.client.keys([ 'Meta', 'w' ]);
      app.browserWindow.focus();
      const toastComponentElement = await app.client.$(`${selectors.visibleWindowSelector} [toast-component]`);
      if (toastComponentElement.value) {
        await app.client.$(`${selectors.visibleWindowSelector} [toast-component]`).click();
      }
      await app.client.$(`${selectors.windowSwitcherSelector}:nth-last-child(2) .window-switcher__close`).click();
      // await app.client.keys([ 'Control', 'W', 'Control' ]);
      await app.client.pause(500);
      const removedElements = await app.client.$$(selectors.windowSwitcherSelector);
      assert.strictEqual(removedElements.length, elements.length - 1, 'Window was not closed.');
    });
    await app.client.addCommand('setTestServerQraphQLUrl', async() => {
      await app.client.$(`${selectors.visibleWindowSelector} .url-box__input input`).setValue('http://localhost:5400/graphql');
      await app.client.keys(['Return']);
      await app.client.$(`${selectors.visibleWindowSelector} .query-editor__input .CodeMirror-scroll`).click();
      await app.client.pause(1000);
    });

    await app.client.pause(500);
  });
  afterEach(async () => {
    if (app.isRunning()) {
      await app.client.pause(1000);
      return app.stop();
    }
  });

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
    await app.client.$(`${selectors.visibleWindowSelector} .url-box__input-btn[track-id="show_docs"]`).click();
    await app.client.pause(100);
    const isDocVisible = await app.client.$(`${selectors.visibleWindowSelector} .app-doc-viewer`).isVisible();
    assert.isTrue(isDocVisible);
    await app.client.closeLastAltairWindow();
  });

  it('can send a request and receive response from server', async() => {
    await app.client.newAltairWindow();
    await app.client.setTestServerQraphQLUrl();

    await app.client.$(`${selectors.visibleWindowSelector} .query-editor__input .CodeMirror-scroll`).click();
    await app.client.pause(100);
    await app.client.keys(`
    { hello }`);
    await app.client.$(`${selectors.visibleWindowSelector} .url-box__button--send`).click();
    await app.client.pause(1000);
    const result = await app.client.$(`${selectors.visibleWindowSelector} app-query-result .app-result .CodeMirror`).getText();
    assert.include(result, 'Hello world');
    await app.client.closeLastAltairWindow();
  });

  it('can send a request with keyboard shortcuts', async() => {
    await app.client.newAltairWindow();
    await app.client.setTestServerQraphQLUrl();

    await app.client.$(`${selectors.visibleWindowSelector} .query-editor__input .CodeMirror-scroll`).click();
    await app.client.pause(100);
    await app.client.keys(`
    { hello }`);
    // Trigger the keys again to release them
    await app.client.keys([ 'Control', 'Return', 'Return', 'Control' ]);
    await app.client.pause(1000);
    const result = await app.client.$(`${selectors.visibleWindowSelector} app-query-result .app-result .CodeMirror`).getText();
    assert.include(result, 'Hello world');
    await app.client.closeLastAltairWindow();
  });

  it('can send a request with multiple requests and see request dropdown', async() => {
    await app.client.newAltairWindow();
    await app.client.setTestServerQraphQLUrl();

    await app.client.$(`${selectors.visibleWindowSelector} .query-editor__input .CodeMirror-scroll`).click();
    await app.client.pause(100);
    await app.client.keys(`
    query A{ hello }
    query B{ bye }`);
    // Trigger the keys again to release them
    await app.client.keys([ 'Control', 'Return', 'Return', 'Control' ]);
    await app.client.pause(100);
    const isRequestDropdownVisible = await app.client.$(`${selectors.visibleWindowSelector} .url-box__button--send-dropdown`).isVisible();
    assert.isTrue(isRequestDropdownVisible);
    await app.client.closeLastAltairWindow();
  });

  it('can add query from doc to query editor', async() => {
    await app.client.newAltairWindow();
    await app.client.setTestServerQraphQLUrl();
    await app.client.$(`${selectors.visibleWindowSelector} .url-box__input-btn[track-id="show_docs"]`).click();
    await app.client.pause(100);
    const isDocVisible = await app.client.$(`${selectors.visibleWindowSelector} .app-doc-viewer`).isVisible();
    assert.isTrue(isDocVisible);
    await app.client.$(`${selectors.visibleWindowSelector} .app-doc-viewer`).$('span*=Query').click();
    await app.client.$(`${selectors.visibleWindowSelector} .app-doc-viewer`).$('.doc-viewer-item-query*=hello').$('.doc-viewer-item-query-add-btn').click();
    await app.client.pause(100);
    const result = await app.client.$(`${selectors.visibleWindowSelector} app-query-editor .query-editor__input .CodeMirror`).getText();
    assert.match(result, /query.*\{.*hello.*\}/s);
    await app.client.closeLastAltairWindow();
  });
});
