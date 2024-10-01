import type { FastifyPluginCallback } from 'fastify';
import type { AltairFastifyPluginOptions as PluginOptions } from './dist/index';

type FastifyAltair = FastifyPluginCallback<PluginOptions>;

namespace fastifyAltairPlugin {
  export type AltairFastifyPluginOptions = PluginOptions;
  export const fastifyAltairPlugin: FastifyAltair;
  export { fastifyAltairPlugin as default };
}

declare function fastifyAltairPlugin(
  ...params: Parameters<FastifyAltair>
): ReturnType<FastifyAltair>;

export = fastifyAltairPlugin;
