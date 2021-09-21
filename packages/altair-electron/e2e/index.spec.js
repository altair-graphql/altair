// https://webdriver.io/docs/api.html
// https://webdriver.io/docs/sync-vs-async.html#common-issues-in-async-mode
const { _electron: electron } = require('playwright');
const Application = require('spectron').Application;
// const chai = require('chai');
// const chaiAsPromised = require('chai-as-promised');
// const assert = chai.assert;
const path = require('path');
// const electron = require('electron');
const { it, describe, expect, beforeEach } = require('@jest/globals');

// chai.use(chaiAsPromised);

const TEST_TIMEOUT = 60000;
const TEST_RETRIES = 3;

// let electronPath = path.join(__dirname, '../node_modules', '.bin', 'electron');
const appPath = path.join(__dirname, '../');

// if (process.platform === 'win32') {
//   electronPath += '.cmd';
// }
const app = new Application({
  path: electron,
  args: [ appPath ],
  env: {
    // SPECTRON: true,
    ELECTRON_ENABLE_LOGGING: true,
    ELECTRON_ENABLE_STACK_DUMPING: true,
    NODE_ENV: 'test'
  },
  startTimeout: TEST_TIMEOUT,
  requireName: 'electronRequire',
  // chromeDriverArgs: [ '--disable-extensions' ],

  // Uncomment this line to debug
  // chromeDriverArgs: [ `remote-debugging-port=${Math.floor(Math.random() * (9999 - 9000) + 9000)}` ]
});

const selectors = {
  windowSwitcherSelector: '.window-switcher:not(.window-switcher--new-window)',
  visibleWindowSelector: 'app-window:not(.hide)',
};

const closeAnyOpenToast = async (_app) => {
  const toastElResult = await _app.client.$('.toast-close-button');
  if (toastElResult.value) {
    (await _app.client.$('.toast-close-button')).click();
    await _app.client.pause(500);
    await closeAnyOpenToast(_app);
  }
};

const closeAnyOpenBackdrops = async (_app) => {
  const backdropElResult = await _app.client.$('.cdk-overlay-backdrop-showing');
  // const isClickable = await _app.client.$('.cdk-overlay-backdrop-showing').isClickable();
  if (backdropElResult.value) {
    // await _app.client.$('.cdk-overlay-backdrop-showing').click();
    await app.client.keys([ 'Escape' ]);
    await _app.client.pause(500);
    await closeAnyOpenBackdrops(_app);
  }
};

jest.setTimeout(TEST_TIMEOUT);
jest.retryTimes(TEST_RETRIES);
// global.before(function() {
//   chai.should();
//   chai.use(chaiAsPromised);
// });
describe('Altair electron', () => {
  beforeEach(async () => {
    try {
      await app.start();
    } catch (err) {
      console.error(err);
      throw err;
    }

    await app.client.addCommand('newAltairWindow', async() => {
      await app.client.waitUntilWindowLoaded();
      const elements = await app.client.$$(selectors.windowSwitcherSelector);
      const $newWindowElement = await app.client.$('.window-switcher--new-window');
      $newWindowElement.click();
      await app.client.pause(500);
      const addedElements = await app.client.$$(selectors.windowSwitcherSelector);
      expect(addedElements.length).toBe(elements.length + 1);
      // assert.strictEqual(, , 'New window was not created.');
    });
    await app.client.addCommand('closeLastAltairWindow', async() => {
      const elements = await app.client.$$(selectors.windowSwitcherSelector);
      await closeAnyOpenToast(app);

      // await app.client.$(`${selectors.windowSwitcherSelector}:nth-last-child(2)`)).click();
      // await app.client.windowByIndex(0);
      // await app.client.keys([ 'Meta', 'w' ]);
      app.browserWindow.focus();
      const toastComponentElement = await app.client.$(`${selectors.visibleWindowSelector} [toast-component]`);
      if (toastComponentElement.value) {
        (await app.client.$(`${selectors.visibleWindowSelector} [toast-component]`)).click();
      }
      await closeAnyOpenBackdrops(app);
      (await app.client.$(`${selectors.windowSwitcherSelector}:nth-last-child(2) .window-switcher__close`)).click();
      // await app.client.keys([ 'Control', 'W', 'Control' ]);
      await app.client.pause(500);
      const removedElements = await app.client.$$(selectors.windowSwitcherSelector);
      expect(removedElements.length).toBe(elements.length - 1);
      // assert.strictEqual(, , 'Window was not closed.');
    });
    await app.client.addCommand('setTestServerQraphQLUrl', async() => {
      const urlboxInput = await app.client.$(`${selectors.visibleWindowSelector} .url-box__input input`);
      urlboxInput.setValue('http://localhost:5400/graphql');
      await app.client.keys(['Return']);
      const codemirrorEditor = await app.client.$(`${selectors.visibleWindowSelector} .query-editor__input .CodeMirror-scroll`);
      codemirrorEditor.click();
      await app.client.pause(1000);
    });
    await app.client.addCommand('writeInQueryEditor', async(content) => {
      const codemirrorEditor = await app.client.$(`${selectors.visibleWindowSelector} .query-editor__input .CodeMirror-scroll`);
      codemirrorEditor.click();
      await app.client.pause(100);
      await app.client.keys(content);
    });
    await app.client.addCommand('sendRequest', async() => {
      // .ant-modal-wrap
      // const modalWrapElementIsVisible = await app.client.$(`.ant-modal-wrap`).isVisible();
      // if (modalWrapElementIsVisible) {
      //   await app.client.$(`.ant-modal-wrap`).click();
      // }
      const urlbuttonSend = await app.client.$(`${selectors.visibleWindowSelector} .url-box__button--send`);
      urlbuttonSend.click();
      await app.client.pause(300);
    });
    await app.client.addCommand('addHeader', async(key, val) => {
      const showHeaderElement = await app.client.$('.side-menu-item[track-id="show_set_headers"]');
      showHeaderElement.click();
      // await app.client.pause(300);
      const addHeaderElement = await app.client.$('nz-modal-container [track-id="add_header"]');
      addHeaderElement.click();
      const emptyHeaderKey = await app.client.$('input[placeholder="Header key"]:empty');
      emptyHeaderKey.setValue(key);
      const emptyHeaderValue = await app.client.$('input[placeholder="Header value"]:empty');
      emptyHeaderValue.setValue(val);
      const saveHeaderModal = await app.client.$('nz-modal-container .app-button.active-primary');
      saveHeaderModal.click();
      await app.client.pause(300);
      // .ant-modal-close-x
      // const modalCloseElement = await app.client.$(`.ant-modal-close-x`);
      // if (modalCloseElement.value) {
      //   await app.client.$(`.ant-modal-close-x`)).click();
      //   await app.client.pause(300);
      // }
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
    expect(app.browserWindow.isVisible()).resolves.toBe(true);
  });

  it('can create window and close window', async() => {
    await app.client.newAltairWindow();
    await app.client.closeLastAltairWindow();
  });

  it('can set URL and see docs loaded automatically', async() => {
    await app.client.newAltairWindow();
    await app.client.setTestServerQraphQLUrl();
    const showDocs = await app.client.$(`${selectors.visibleWindowSelector} .url-box__input-btn[track-id="show_docs"]`);
    showDocs.click();
    await app.client.pause(100);
    const docViewer = await app.client.$(`${selectors.visibleWindowSelector} .app-doc-viewer`);
    const isDocVisible = await docViewer.isDisplayedInViewport();
    // assert.isTrue(isDocVisible);
    expect(isDocVisible).toBeTruthy();
    await app.client.closeLastAltairWindow();
  });

  it('can send a request and receive response from server', async() => {
    await app.client.newAltairWindow();
    await app.client.setTestServerQraphQLUrl();

    await app.client.writeInQueryEditor(`
    { hello }`);
    const sendRequestButton = await app.client.$(`${selectors.visibleWindowSelector} .url-box__button--send`);
    sendRequestButton.click();
    await app.client.pause(1000);
    const queryResult = await app.client.$(`${selectors.visibleWindowSelector} app-query-result .app-result .CodeMirror`);
    const result = await queryResult.getText();

    expect(result).toContain('Hello world');
    // assert.include(result, 'Hello world');
    await app.client.closeLastAltairWindow();
  });

  it('can send a request with keyboard shortcuts', async() => {
    await app.client.newAltairWindow();
    await app.client.setTestServerQraphQLUrl();

    await app.client.writeInQueryEditor(`
    { hello }`);
    // Trigger the keys again to release them
    await app.client.keys([ 'Control', 'Return', 'Return', 'Control' ]);
    await app.client.pause(1000);
    const queryResult = await app.client.$(`${selectors.visibleWindowSelector} app-query-result .app-result .CodeMirror`);
    const result = await queryResult.getText();

    expect(result).toContain('Hello world');
    // assert.include(result, 'Hello world');
    await app.client.closeLastAltairWindow();
  });

  it('can send a request with multiple queries and see request dropdown', async() => {
    await app.client.newAltairWindow();
    await app.client.setTestServerQraphQLUrl();

    await app.client.writeInQueryEditor(`
    query A{ hello }
    query B{ bye }`);
    // Trigger the keys again to release them
    await app.client.keys([ 'Control', 'Return', 'Return', 'Control' ]);
    await app.client.pause(100);
    const sendRequestDropdown = await app.client.$(`${selectors.visibleWindowSelector} .url-box__button--send-dropdown`);
    const isRequestDropdownVisible = await sendRequestDropdown.isDisplayedInViewport();
    expect(isRequestDropdownVisible).toBe(true);
    await app.client.closeLastAltairWindow();
  });

  it('can change the HTTP method', async() => {
    await app.client.newAltairWindow();
    const httpVerbDropdown = await app.client.$(`${selectors.visibleWindowSelector} [track-id="http_verb"]`);
    const httpVerb = await httpVerbDropdown.getText();
    expect(httpVerb).toContain('POST');
    const httpVerbDropdown2 = await app.client.$(`${selectors.visibleWindowSelector} [track-id="http_verb"]`);
    await httpVerbDropdown2.click();
    await app.client.pause(300);
    const httpVerbGet = await app.client.$('.ant-dropdown-menu-item*=GET');
    await httpVerbGet.click();
    const httpVerbDropdown3 = await app.client.$(`${selectors.visibleWindowSelector} [track-id="http_verb"]`);
    const httpVerbText = await httpVerbDropdown3.getText();
    expect(httpVerbText).toContain('GET');

    await app.client.closeLastAltairWindow();
  });

  it('can prettify the query', async() => {
    await app.client.newAltairWindow();
    await app.client.setTestServerQraphQLUrl();

    await app.client.writeInQueryEditor(`
    { hello }`);
    const toolsMenuItem = await app.client.$('.side-menu-item app-icon[name="briefcase"]');
    await toolsMenuItem.click();
    const prettifyMenuItem = await app.client.$('.side-menu-item [track-id="prettify"]');
    await prettifyMenuItem.click();
    await app.client.pause(300);
    const codemirrorEditor = await app.client.$(`${selectors.visibleWindowSelector} .query-editor__input .CodeMirror-code`);
    const result = await codemirrorEditor.getText();
    expect(result.replace(/\d/ug, '')).toContain('{\n\n  hello\n\n}');

    await app.client.closeLastAltairWindow();
  });

  it('can copy the query as cURL', async() => {
    await app.client.newAltairWindow();
    await app.client.setTestServerQraphQLUrl();

    await app.client.writeInQueryEditor(`
    { hello }`);
    const toolsMenuItem = await app.client.$('.side-menu-item app-icon[name="briefcase"]');
    await toolsMenuItem.click();
    const copyAsCurlMenuItem = await app.client.$('.side-menu-item [track-id="copy_as_curl"]');
    await copyAsCurlMenuItem.click();
    await app.client.pause(100);
    const clipboardText = await app.electron.clipboard.readText();
    expect(clipboardText).toBe('curl \'http://localhost:5400/graphql\' -H \'Accept-Encoding: gzip, deflate, br\' -H \'Content-Type: application/json\' -H \'Accept: application/json\' -H \'Connection: keep-alive\' -H \'Origin: altair://-\' --data-binary \'{"query":"# Welcome to Altair GraphQL Client.\\n# You can send your request using CmdOrCtrl + Enter.\\n\\n# Enter your graphQL query here.\\n\\n    { hello }","variables":{}}\' --compressed');

    await app.client.closeLastAltairWindow();
  });

  it('can add query from doc to query editor', async() => {
    await app.client.newAltairWindow();
    await app.client.setTestServerQraphQLUrl();
    const showDocsButton = await app.client.$(`${selectors.visibleWindowSelector} .url-box__input-btn[track-id="show_docs"]`);
    showDocsButton.click();
    await app.client.pause(100);
    const docViewer = await app.client.$(`${selectors.visibleWindowSelector} .app-doc-viewer`);
    const isDocVisible = await docViewer.isDisplayedInViewport();
    expect(isDocVisible).toBe(true);
    // const docViewer2 = await app.client.$(`${selectors.visibleWindowSelector} .app-doc-viewer`);
    const QueryDoc = await docViewer.$('span*=Query');
    await QueryDoc.click();
    const helloQuery = await docViewer.$('.doc-viewer-item-query*=hello');
    const addHelloQuery = await helloQuery.$('.doc-viewer-item-query-add-btn');
    await addHelloQuery.click();
    await app.client.pause(100);
    const codemirrorEditor = await app.client.$(`${selectors.visibleWindowSelector} app-query-editor .query-editor__input .CodeMirror`);
    const result = await codemirrorEditor.getText();
    expect(result).toMatch(/query.*\{.*hello.*\}/us);
    await app.client.closeLastAltairWindow();
  });

  it('can send request with header', async() => {
    await app.client.newAltairWindow();
    await app.client.setTestServerQraphQLUrl();

    await app.client.writeInQueryEditor(`
    { hello }`);
    await app.client.addHeader('x-auth-token', 'some-random-token');
    await app.client.sendRequest();
    await app.client.pause(500);
    const logs = await app.client.getMainProcessLogs();
    expect(logs.join('')).toContain('Header sent: x-auth-token some-random-token');
    await app.client.closeLastAltairWindow();
  });

  it('can override Origin header', async() => {
    await app.client.newAltairWindow();
    await app.client.setTestServerQraphQLUrl();

    await app.client.writeInQueryEditor(`
    { hello }`);
    await app.client.addHeader('Origin', 'https://ezio-tester.client');
    await app.client.sendRequest();
    await app.client.pause(500);
    const logs = await app.client.getMainProcessLogs();
    expect(logs.join('')).toContain('Header sent: Origin https://ezio-tester.client');
    await app.client.closeLastAltairWindow();
  });

  it('can send request with query variables', async() => {
    await app.client.newAltairWindow();
    await app.client.setTestServerQraphQLUrl();

    await app.client.writeInQueryEditor(`
    { hello }`);
    const toggleVariables = await app.client.$(`${selectors.visibleWindowSelector} [track-id="toggle_variables"]`);
    await toggleVariables.click();
    const codemirrorEditor = await app.client.$(`${selectors.visibleWindowSelector} app-variables-editor .CodeMirror-scroll`);
    await codemirrorEditor.click();
    await app.client.keys(['Backspace', 'Backspace', 'Backspace']);
    // if (process.platform === 'win32') {
    //   await app.client.keys(['Control', 'a', 'Control', 'Backspace']);
    // } else {
    //   await app.client.keys(['Meta', 'a', 'Meta', 'Backspace']);
    // }
    await app.client.keys('{ "var1": "value1" }');
    await app.client.sendRequest();
    await app.client.pause(500);

    const logs = (await app.client.getMainProcessLogs()).filter(log => log.includes('Data sent:'));
    const expectedLog = logs.find(log => {
      try {
        const data = JSON.parse(log.replace('Data sent:', ''));
        return data.variables && data.variables.var1 && data.variables.var1 === 'value1';
      } catch (err) {
        return false;
      }
    });
    expect(expectedLog).toBeTruthy();
    await app.client.closeLastAltairWindow();
  });
});
