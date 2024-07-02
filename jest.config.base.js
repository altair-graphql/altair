module.exports = (dir, env = 'jsdom') => {
  const pkg = require(`${dir}/package.json`);
  return {
    clearMocks: true,
    collectCoverage: true,
    testEnvironment: env,
    roots: [`<rootDir>`],
    rootDir: dir,
    displayName: pkg.name,
  };
};
