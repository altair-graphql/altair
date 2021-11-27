// const { _electron: electron } = require('playwright');
import { ElectronApplication, Page, _electron as electron } from 'playwright';
import { test, expect } from '@playwright/test';
import * as SELECTORS from './selectors';

const helpers = {
  async newAltairWindow(window: Page) {
    const windowSwitcherElements = await window.$$(SELECTORS.WINDOW_SWITCHER);
    await window.click('text=Add new');
    const newWindowSwitcherElements = await window.$$(SELECTORS.WINDOW_SWITCHER);
    expect(newWindowSwitcherElements.length).toBe(windowSwitcherElements.length + 1);
  },
  async closeLastAltairWindow(window: Page) {
    const windowSwitcherElements = await window.$$(SELECTORS.WINDOW_SWITCHER);
    const closeButtons = await window.$$(SELECTORS.WINDOW_SWITCHER_CLOSE);
    expect(closeButtons.length).toBeTruthy();
    await closeButtons.pop().click();
    const newWindowSwitcherElements = await window.$$(SELECTORS.WINDOW_SWITCHER);
    expect(newWindowSwitcherElements.length).toBe(windowSwitcherElements.length - 1);
  },
  async setTestGraphQLServerUrl(window: Page) {
    const urlboxInput = await window.$(SELECTORS.VISIBLE_WINDOW_URL_INPUT);
    await urlboxInput.fill('http://localhost:5400/graphql');
    await urlboxInput.press('Enter');
  },
  async writeQueryInEditor(window: Page, query: string) {
    const queryEditor = await window.$(SELECTORS.VISIBLE_WINDOW_QUERY_EDITOR);
    await queryEditor.click();
    // Clear editor
    await queryEditor.press('Meta+A');
    await queryEditor.press('Backspace');

    await queryEditor.type(`${query}`);
  },
  async getQueryResultData(window: Page) {
    return await window.$eval(`${SELECTORS.VISIBLE_WINDOW} app-query-result .app-result .CodeMirror`, (el: any) => el.CodeMirror.getValue());
  },
  async getQueryEditorContent(window: Page) {
    return await window.$eval(SELECTORS.VISIBLE_WINDOW_QUERY_CODEMIRROR, (el: any) => el.CodeMirror.getValue());
  },
  async showDocs(window: Page) {
    const showDocs = await window.$(`${SELECTORS.VISIBLE_WINDOW} button[track-id="show_docs"]`);
    await showDocs.click();
    const docViewer = await window.$(`${SELECTORS.VISIBLE_WINDOW} .app-doc-viewer`);
    expect(await docViewer.isVisible()).toBeTruthy();

    return docViewer;
  },
  async addHeader(window: Page, key: string, value: string) {
    const showHeaderElement = await window.$('.side-menu-item[track-id="show_set_headers"]');
    await showHeaderElement.click();
    const addHeaderElement = await window.$('nz-modal-container [track-id="add_header"]');
    await addHeaderElement.click();
    const emptyHeaderKey = await window.$('input[placeholder="Header key"]:empty');
    await emptyHeaderKey.fill(key);
    const emptyHeaderValue = await window.$('input[placeholder="Header value"]:empty');
    await emptyHeaderValue.fill(value);
    const saveHeaderModal = await window.$('nz-modal-container .app-button.active-primary');
    await saveHeaderModal.click();
  },
  async sendRequest(window: Page) {
    const sendRequestButton = await window.$(`${SELECTORS.VISIBLE_WINDOW} .send-request__button`);
    await sendRequestButton.click();
  },
};

let app: ElectronApplication;
let window: Page;

test.beforeEach(async () => {
  // Launch Electron app.
  app = await electron.launch({ args: ['index.js'] });

  // Evaluation expression in the Electron context.
  const appPath = await app.evaluate(({ app }) => {
    // This runs in the main Electron process, parameter here is always
    // the result of the require('electron') in the main app script.
    return app.getAppPath();
  });
  console.log(appPath);
  
  // Get the first window that the app opens, wait if necessary.
  window = await app.firstWindow();

  // Wait for the window switcher to be visible
  await window.waitForSelector(SELECTORS.WINDOW_SWITCHER);

  // Capture a screenshot.
  // await window.screenshot({ path: 'intro.png' });
  // Direct Electron console to Node terminal.
  window.on('console', console.log);
});
test.afterEach(async () => {
  // Exit app.
  await app.close();
});


test('loads window successfully', async () => {
  const windowSwitcher = await window.$(SELECTORS.WINDOW_SWITCHER);
  expect(windowSwitcher).not.toBeNull();
});

test('can create window and close window', async () => {
  await helpers.newAltairWindow(window);
  await helpers.closeLastAltairWindow(window);
});

test('can set URL and see docs loaded automatically', async () => {
  await helpers.newAltairWindow(window);
  await helpers.setTestGraphQLServerUrl(window);
  await helpers.showDocs(window);
  await helpers.closeLastAltairWindow(window);
});

test('can send a request and receive response from server', async () => {
  await helpers.newAltairWindow(window);
  await helpers.setTestGraphQLServerUrl(window);
  await helpers.writeQueryInEditor(window, `{ hello }`);
  const sendRequestButton = await window.$(`${SELECTORS.VISIBLE_WINDOW} .send-request__button`);
  await sendRequestButton.click();
  await window.waitForTimeout(1000);
  const result = await helpers.getQueryResultData(window);

  expect(result).toContain('Hello world');
  await helpers.closeLastAltairWindow(window);
});

test('can send a request with keyboard shortcuts', async () => {
  await helpers.newAltairWindow(window);
  await helpers.setTestGraphQLServerUrl(window);
  await helpers.writeQueryInEditor(window, `{ hello }`);
  await window.press(SELECTORS.VISIBLE_WINDOW_QUERY_EDITOR, 'Control+Enter');
  await window.waitForTimeout(1000);
  const result = await helpers.getQueryResultData(window);

  expect(result).toContain('Hello world');
  await helpers.closeLastAltairWindow(window);
});

test('can send a request with multiple queries and see request dropdown', async () => {
  await helpers.newAltairWindow(window);
  await helpers.setTestGraphQLServerUrl(window);
  await helpers.writeQueryInEditor(window, `
    query A{ hello }
    query B{ bye }
  `);
  await window.press(SELECTORS.VISIBLE_WINDOW_QUERY_EDITOR, 'Control+Enter');
  const sendRequestButton = await window.$(`${SELECTORS.VISIBLE_WINDOW} .send-request__button.ant-dropdown-trigger`);
  expect(sendRequestButton).toBeTruthy();

  await helpers.closeLastAltairWindow(window);
});

test('can change the HTTP method', async () => {
  await helpers.newAltairWindow(window);
  const httpVerbDropdown = await window.$(`${SELECTORS.VISIBLE_WINDOW} [track-id="http_verb"]`);
  const httpVerb = await httpVerbDropdown.textContent();
  expect(httpVerb).toContain('POST');
  await httpVerbDropdown.click();
  await window.waitForTimeout(300); // wait for the CSS animation
  const httpVerbGet = await window.$('.ant-dropdown-menu-item:has-text("GET")');
  await httpVerbGet.click();
  const httpVerbText = await httpVerbDropdown.textContent();
  expect(httpVerbText).toContain('GET');

  await helpers.closeLastAltairWindow(window);
});

test('can prettify the query', async () => {
  await helpers.newAltairWindow(window);
  
  await helpers.writeQueryInEditor(window, `
    { hello }
  `);
  const toolsMenuItem = await window.$('.side-menu-item app-icon[name="briefcase"]');
  await toolsMenuItem.click();
  const prettifyMenuItem = await window.$('.side-menu-item [track-id="prettify"]');
  await prettifyMenuItem.click();
  const result = await helpers.getQueryEditorContent(window);

  expect(result).toContain('{\n  hello\n}');

  await helpers.closeLastAltairWindow(window);
});

test('can copy the query as cURL', async () => {
  await helpers.newAltairWindow(window);
  await helpers.setTestGraphQLServerUrl(window);
  await helpers.writeQueryInEditor(window, `
    { hello }
  `);
  const toolsMenuItem = await window.$('.side-menu-item app-icon[name="briefcase"]');
  await toolsMenuItem.click();
  const prettifyMenuItem = await window.$('.side-menu-item [track-id="copy_as_curl"]');
  await prettifyMenuItem.click();

  const clipboardText = await app.evaluate(({ clipboard }) => clipboard.readText());
  expect(clipboardText).toBe('curl \'http://localhost:5400/graphql\' -H \'Accept-Encoding: gzip, deflate, br\' -H \'Content-Type: application/json\' -H \'Accept: application/json\' -H \'Connection: keep-alive\' -H \'Origin: altair://-\' --data-binary \'{"query":"\\n    { hello }\\n      ","variables":{}}\' --compressed');

  await helpers.closeLastAltairWindow(window);
});

test.only('can add query from doc to query editor', async () => {
  await helpers.newAltairWindow(window);
  await helpers.setTestGraphQLServerUrl(window);
  const docViewer = await helpers.showDocs(window);

  const QueryDoc = await docViewer.$('span:has-text("Query")');
  await QueryDoc.click();
  const helloQuery = await docViewer.$('.doc-viewer-item-query:has-text("hello")');
  const addHelloQuery = await helloQuery.$('.doc-viewer-item-query-add-btn');
  await addHelloQuery.click();
  const result = await helpers.getQueryEditorContent(window);
  expect(result).toMatch(/query.*\{.*hello.*\}/us);
  await helpers.closeLastAltairWindow(window);
});
