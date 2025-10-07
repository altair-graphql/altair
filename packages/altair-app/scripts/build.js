const ncp = require('ncp').ncp;
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

ncp.limit = 16;

const deleteFolderRecursive = function (path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file, index) {
      const curPath = path + '/' + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};
const copySandbox = () => {
  // copy iframe-sandbox dist files into dist/iframe-sandbox directory
  const altairSandboxDistFile = require.resolve('@altairgraphql/iframe-sandbox');
  const distSrc = path.join(altairSandboxDistFile, '..'); // From the altair-sandbox dist folder
  const distDestination = path.join(__dirname, '../dist/browser/iframe-sandbox'); // To altair-app dist/browser/iframe-sandbox folder
  deleteFolderRecursive(distDestination);
  fs.mkdirSync(distDestination, { recursive: true });

  const srcDir = path.resolve(__dirname, '../src');

  const indexHtmlFile = path.join(distDestination, 'index.html');

  /**
   * Copy dist files into dist directory.
   * Set base to ./
   * Set the scripts and styles in template.html
   * Add template.html to dist directory.
   */
  ncp(distSrc, distDestination, function (err) {
    if (err) {
      console.error(err);
      throw err;
    }

    const htmlString = fs
      .readFileSync(path.resolve(distSrc, 'index.html'), 'utf8')
      // Set base to ./
      .replace('<base href="/" />', '<base href="./" />')
      .replaceAll('src="/assets/', 'src="./assets/')
      .replaceAll('href="/assets/', 'href="./assets/');

    fs.writeFileSync(path.join(distDestination, 'index.html'), htmlString);
    console.log('Done copying dist folder!');
  });
};

const main = () => {
  execSync('pnpm ng:build', {
    cwd: path.resolve(__dirname, '../'),
    stdio: 'inherit',
  });
  execSync('pnpm sentry:sourcemaps:inject', {
    cwd: path.resolve(__dirname, '../'),
    stdio: 'inherit',
  });
  copySandbox();
};
main();
