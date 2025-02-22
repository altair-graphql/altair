import { Plugin } from 'vitepress';

interface ViteDynamicFilesPluginOptions {
  fileName: string;
  source: string;
}

export const getViteDynamicFilesPlugin = ({
  fileName = 'data/test.json',
  source = JSON.stringify({ hello: 'world' }),
}: ViteDynamicFilesPluginOptions): Plugin => {
  return {
    name: 'vite-plugin-dynamic-files',
    buildStart(options) {
      if (this.meta.watchMode) {
        console.log('in watch mode');
        return;
      }
      this.emitFile({
        type: 'asset',
        fileName,
        source,
      });
    },
    configureServer(server) {
      server.middlewares.use(`/${fileName}`, (req, res) => {
        res.writeHead(200, {
          'access-control-allow-origin': '*',
          // 'Content-Type': 'application/json',
        });
        res.end(source);
      });
    },
  };
};
