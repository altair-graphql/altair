module.exports = {
  make_targets: {
    win32: [
      'squirrel'
    ],
    darwin: [
      'zip'
    ],
    linux: [
      'deb',
      'rpm'
    ]
  },
  electronPackagerConfig: {
    asar: true,
    quiet: true,
    protocol: 'altair://',
    protocolName: 'Altair GraphQL Client File',
    icon: './electron/icon',
    prune: true,
    // "ignore": [
    //   "idea",
    //   "bin",
    //   "chrome-ext-files",
    //   "docs",
    //   "e2e",
    //   "src"
    // ],
    ignore: (path) => {
      const tests = [
        // Ignore git directory
        () => /^\/\.git\/.*/g,
        // Ignore idea directory
        () => /^\/\.idea\/.*/g,
        // Ignore root dev FileDescription
        () => /^\/(bin|chrome-ext-files|docs|e2e|src|test|.cert.pfx|.editorconfig|.eslintignore|.eslintrc|.gitignore|.travis.yml|appveyor.yml|circle.yml|CONTRIBUTING.md|Gruntfile.js|gulpfile.js|ISSUE_TEMPLATE.md|LICENSE|README.md)(\/|$)/g, // eslint-disable-line
      ];
      for (let i = 0; i < tests.length; i++) {
        if (tests[i]().test(path)) {
          return true;
        }
      }
      return false;
    },
  },
  electronWinstallerConfig: {
    name: 'Altair',
    setupIcon: './electron/icon.ico'
  },
  electronInstallerDebian: {},
  electronInstallerRedhat: {},
  github_repository: {
    owner: 'imolorhe',
    name: 'altair'
  },
  windowsStoreConfig: {
    packageName: 'Altair GraphQL Client'
  }
};
