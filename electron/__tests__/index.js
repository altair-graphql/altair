const Application = require('spectron').Application;
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
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

global.before(function() {
  chai.should();
  chai.use(chaiAsPromised);
});
describe('Altair electron', () => {
  beforeEach(function() {
    this.timeout(20000);
    return app.start();
  });
  afterEach(() => app.stop());

  it('load window successfully', () => {
    return app.browserWindow.isVisible().should.eventually.equal(true);
  });
});
