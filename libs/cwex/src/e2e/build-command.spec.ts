import path from 'path';
import fs from 'fs-extra';
import { exec } from 'child_process';
jest.unmock('web-ext');

const cli = (args: string[], cwd = process.cwd()): Promise<any> => {
  return new Promise(resolve => { 
    const command = `yarn ts-node ${path.resolve('./src/cli.ts')} ${args.join(' ')}`;

    exec(command, { cwd }, (error, stdout, stderr) => {
      resolve({
        code: error && error.code ? error.code : 0,
        error,
        stdout,
        stderr,
      });
  })
})};

describe('build command', () => {
  it('builds successfully', async () => {
    jest.setTimeout(20000);
    await fs.remove(path.resolve(__dirname, './e2e-test-out'));
    const result = await cli([ 'build', '--config', './src/e2e/fixtures/cwex.yml' ]);
    expect(result.code).toBe(0);
    expect(await fs.pathExists(path.resolve(__dirname, './e2e-test-out'))).toBeTruthy();
    expect(await fs.pathExists(path.resolve(__dirname, './e2e-test-out', 'chrome-files'))).toBeTruthy();
    expect(await fs.pathExists(path.resolve(__dirname, './e2e-test-out', 'chrome-files', 'manifest.json'))).toBeTruthy();
    expect(fs.readFileSync(path.resolve(__dirname, './e2e-test-out', 'chrome-files', 'manifest.json'), 'utf8')).toMatchSnapshot();
    expect(await fs.pathExists(path.resolve(__dirname, './e2e-test-out', 'chrome-build'))).toBeTruthy();
    expect(await fs.pathExists(path.resolve(__dirname, './e2e-test-out', 'chrome-build', 'chrome.zip'))).toBeTruthy();
    expect(await fs.pathExists(path.resolve(__dirname, './e2e-test-out', 'mozilla-files'))).toBeTruthy();
    expect(await fs.pathExists(path.resolve(__dirname, './e2e-test-out', 'mozilla-files', 'manifest.json'))).toBeTruthy();
    expect(fs.readFileSync(path.resolve(__dirname, './e2e-test-out', 'mozilla-files', 'manifest.json'), 'utf8')).toMatchSnapshot();
    expect(await fs.pathExists(path.resolve(__dirname, './e2e-test-out', 'mozilla-build'))).toBeTruthy();
  });
});
