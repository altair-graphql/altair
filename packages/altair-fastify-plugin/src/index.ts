import {
  getDistDirectory,
  renderAltair,
  RenderOptions,
  renderInitialOptions,
} from 'altair-static';
import fp from 'fastify-plugin';
import fastifyStatic from '@fastify/static';

import type { FastifyPluginCallback } from 'fastify';

export interface AltairFastifyPluginOptions extends RenderOptions {
  /**
   * URL to set as the server endpoint.
   *
   * By default is `/graphql`
   */
  endpointURL?: string;
  /**
   * URL to be used as a base for relative URLs and hosting needed static files.
   *
   * By default is `/altair/`
   */
  baseURL?: string;
  /**
   * Path in which Altair will be accesible.
   *
   * By default is `/altair`
   */
  path?: string;
}

const fastifyAltairPlugin: FastifyPluginCallback<AltairFastifyPluginOptions> = (
  fastify,
  {
    path = '/altair',
    baseURL = '/altair/',
    endpointURL = '/graphql',
    ...renderOptions
  } = {},
  done
) => {
  fastify.register(fastifyStatic, {
    root: getDistDirectory(),
    prefix: baseURL,
  });

  const altairPage = renderAltair({ baseURL, endpointURL, ...renderOptions });

  fastify.get(path, (_req, res) => {
    res.type('text/html').send(altairPage);
  });

  if (renderOptions.serveInitialOptionsInSeperateRequest) {
    const initialOptions = renderInitialOptions(renderOptions);
    const initOptPath = path + '/initial_options.js';

    fastify.get(initOptPath, (_req, res) => {
      res.type('application/javascript').send(initialOptions);
    });
  }

  done();
};

export default fp(fastifyAltairPlugin, {
  fastify: '>= 3.x',
  name: 'altair-fastify-plugin',
});
