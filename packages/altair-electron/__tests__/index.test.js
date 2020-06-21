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

const closeAnyOpenBackdrops = async (app) => {
  const backdropElResult = await app.client.$('.cdk-overlay-backdrop-showing');
  // const isClickable = await app.client.$('.cdk-overlay-backdrop-showing').isClickable();
  if (backdropElResult.value) {
    await app.client.$('.cdk-overlay-backdrop-showing').click();
    await app.client.pause(500);
    await closeAnyOpenBackdrops(app);
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
      await app.client.waitUntilWindowLoaded();
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
      await closeAnyOpenBackdrops(app);
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
    await app.client.addCommand('writeInQueryEditor', async(content) => {
      await app.client.$(`${selectors.visibleWindowSelector} .query-editor__input .CodeMirror-scroll`).click();
      await app.client.pause(100);
      await app.client.keys(content);
    });
    await app.client.addCommand('sendRequest', async() => {
      // .ant-modal-wrap
      // const modalWrapElementIsVisible = await app.client.$(`.ant-modal-wrap`).isVisible();
      // if (modalWrapElementIsVisible) {
      //   await app.client.$(`.ant-modal-wrap`).click();
      // }
      await app.client.$(`${selectors.visibleWindowSelector} .url-box__button--send`).click();
      await app.client.pause(300);
    });
    await app.client.addCommand('addHeader', async(key, val) => {
      await app.client.$(`.side-menu-item[track-id="show_set_headers"]`).click();
      // await app.client.pause(300);
      await app.client.$('nz-modal-container [track-id="add_header"]').click();
      await app.client.$('input[placeholder="Header key"]:empty').setValue(key);
      await app.client.$('input[placeholder="Header value"]:empty').setValue(val);
      await app.client.$('nz-modal-container .app-button.active-primary').click();
      await app.client.pause(300);
      // .ant-modal-close-x
      // const modalCloseElement = await app.client.$(`.ant-modal-close-x`);
      // if (modalCloseElement.value) {
      //   await app.client.$(`.ant-modal-close-x`).click();
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

    await app.client.writeInQueryEditor(`
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

    await app.client.writeInQueryEditor(`
    { hello }`);
    // Trigger the keys again to release them
    await app.client.keys([ 'Control', 'Return', 'Return', 'Control' ]);
    await app.client.pause(1000);
    const result = await app.client.$(`${selectors.visibleWindowSelector} app-query-result .app-result .CodeMirror`).getText();
    assert.include(result, 'Hello world');
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
    const isRequestDropdownVisible = await app.client.$(`${selectors.visibleWindowSelector} .url-box__button--send-dropdown`).isVisible();
    assert.isTrue(isRequestDropdownVisible);
    await app.client.closeLastAltairWindow();
  });

  it('can change the HTTP method', async() => {
    await app.client.newAltairWindow();
    const httpVerb = await app.client.$(`${selectors.visibleWindowSelector} [track-id="http_verb"]`).getText();
    assert.include(httpVerb, 'POST');
    await app.client.$(`${selectors.visibleWindowSelector} [track-id="http_verb"]`).click();
    await app.client.pause(300);
    await app.client.$(`.ant-dropdown-menu-item*=GET`).click();
    assert.include(await app.client.$(`${selectors.visibleWindowSelector} [track-id="http_verb"]`).getText(), 'GET');

    await app.client.closeLastAltairWindow();
  });

  it('can prettify the query', async() => {
    await app.client.newAltairWindow();
    await app.client.setTestServerQraphQLUrl();

    await app.client.writeInQueryEditor(`
    { hello }`);
    await app.client.$(`.side-menu-item app-icon[name="briefcase"]`).click();
    await app.client.$(`.side-menu-item [track-id="prettify"]`).click();
    await app.client.pause(300);
    const result = (await app.client.$(`${selectors.visibleWindowSelector} .query-editor__input .CodeMirror-code`).getText()).replace(/\d/g, '');
    assert.include(result, '{\n\n  hello\n\n}');

    await app.client.closeLastAltairWindow();
  });

  it('can copy the query as cURL', async() => {
    await app.client.newAltairWindow();
    await app.client.setTestServerQraphQLUrl();

    await app.client.writeInQueryEditor(`
    { hello }`);
    await app.client.$(`.side-menu-item app-icon[name="briefcase"]`).click();
    await app.client.$(`.side-menu-item [track-id="copy_as_curl"]`).click();
    await app.client.pause(100);
    const clipboardText = await app.electron.clipboard.readText();
    assert.equal(clipboardText, `curl 'http://localhost:5400/graphql' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'Origin: altair://-' --data-binary '{"query":"\\n  # Welcome to Altair GraphQL Client.\\n  # You can send your request using CmdOrCtrl + Enter.\\n\\n  # Enter your graphQL query here.\\n\\n      { hello }","variables":{}}' --compressed`);

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

  it('can send request with header', async() => {
    await app.client.newAltairWindow();
    await app.client.setTestServerQraphQLUrl();

    await app.client.writeInQueryEditor(`
    { hello }`);
    await app.client.addHeader('x-auth-token', 'some-random-token');
    await app.client.sendRequest();
    await app.client.pause(500);
    const logs = await app.client.getMainProcessLogs();
    assert.isTrue(logs.includes('Header sent: x-auth-token some-random-token'));
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
    assert.isTrue(logs.includes('Header sent: Origin https://ezio-tester.client'));
    await app.client.closeLastAltairWindow();
  });

  it('can send request with query variables', async() => {
    await app.client.newAltairWindow();
    await app.client.setTestServerQraphQLUrl();

    await app.client.writeInQueryEditor(`
    { hello }`);
    await app.client.$(`${selectors.visibleWindowSelector} [track-id="toggle_variables"]`).click();
    await app.client.$(`${selectors.visibleWindowSelector} app-variables-editor .CodeMirror-scroll`).click();
    await app.client.keys(['Backspace', 'Backspace', 'Backspace']);
    // if (process.platform === 'win32') {
    //   await app.client.keys(['Control', 'a', 'Control', 'Backspace']);
    // } else {
    //   await app.client.keys(['Meta', 'a', 'Meta', 'Backspace']);
    // }
    await app.client.keys(`{ "var1": "value1" }`);
    await app.client.sendRequest();
    await app.client.pause(500);

    const logs = (await app.client.getMainProcessLogs()).filter(log => log.includes('Data sent:'));
    const expectedLog = logs.find(log => {
      try {
        const data = JSON.parse(log.replace('Data sent:', ''));
        return data.variables && data.variables.var1 && data.variables.var1 === 'value1';
      } catch(err) {
        return false;
      }
    });
    // assert.strictEqual(logs, []);
    assert.exists(expectedLog);
    await app.client.closeLastAltairWindow();
  });
});
