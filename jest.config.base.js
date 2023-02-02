module.exports = (dir, env = 'jsdom') => {
  const package = require(`${dir}/package.json`);
  return {
    clearMocks: true,
    collectCoverage: true,
    testEnvironment: env,
    roots: [`<rootDir>`],
    rootDir: dir,
    displayName: package.name,
  };
};
