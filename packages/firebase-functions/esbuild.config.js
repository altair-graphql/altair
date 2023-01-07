const pkgJson = require('./package.json');

require('esbuild')
  .build({
    // the entry point file described above
    entryPoints: ['./src'],
    // the build folder location described above
    outfile: 'dist/bundle.js',
    bundle: true,
    platform: 'node',
    // target: [pkgJson.engines.node],
    // Optional and for development only. This provides the ability to
    // map the built code back to the original source format when debugging.
    sourcemap: 'inline',
  })
  .catch((err) => console.error(err) || process.exit(1));
