const esbuild = require('esbuild');

async function main() {
  await esbuild.build({
    entryPoints: ['src/index.ts'],
    outfile: 'build/index.js',
    platform: 'node',
    target: 'node13.2',
    format: 'cjs',
    bundle: true,
    minify: false,
  });
}

main();
