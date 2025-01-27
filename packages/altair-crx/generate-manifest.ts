import { ManifestV3Export } from '@crxjs/vite-plugin';
import { Plugin } from 'vite';

export const generateManifest = (manifest: chrome.runtime.ManifestV3): Plugin => {
  return {
    name: 'generate-manifest',
    buildStart(opts) {
      console.log('Generating manifest.json');
      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: JSON.stringify(manifest),
      });
    },
  };
};
