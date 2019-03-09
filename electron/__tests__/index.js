const Application = require('spectron').Application;
const assert = require('assert');
const path = require('path');

console.log(__dirname);
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
    NODE_ENV: 'development'
  },
  startTimeout: 20000,
});

app.start().then(() => {
  // Check if the window is visible
  return app.browserWindow.isVisible();
}).then((isVisible) => {
  // Verify the window is visible
  assert.equal(isVisible, true);
}).then(() => {
  // Get the window's title
  return app.client.getTitle();
}).then((title) => {
  // Verify the window's title
  assert.equal(title, 'Altair');
}).then(() => {
  // Stop the application
  return app.stop();
}).catch((error) => {
  // Log any failures
  console.error('Test failed', error.message);
  return app.stop();
})