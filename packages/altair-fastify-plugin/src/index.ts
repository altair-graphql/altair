import {
  getDistDirectory,
  renderAltair,
  RenderOptions,
  renderInitSnippet,
} from 'altair-static';
import fp from 'fastify-plugin';
import fastifyStatic from '@fastify/static';

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export interface AltairFastifyPluginOptions extends RenderOptions {
  /**
   * Path in which Altair will be accesible.
   *
   * By default is `/altair`
   */
  path?: string;

  /**
   * Generates a Content Security Policy (CSP) nonce for the request.
   * @param req The Fastify request object.
   * @param res The Fastify response object.
   * @returns The generated CSP nonce.
   */
  cspNonceGenerator?: (req: unknown, res: unknown) => string;
}

const fastifyAltairPluginFn = async (
  fastify: FastifyInstance,
  { path = '/altair', ...renderOptions }: AltairFastifyPluginOptions = {}
) => {
  fastify.register(fastifyStatic, {
    root: getDistDirectory(),
    prefix: renderOptions.baseURL ?? '/altair/',
  });

  fastify.get(path, (req, res) => {
    const altairPage = renderAltair(
      getRequestRenderOptions(req, res, renderOptions)
    );
    res.type('text/html').send(altairPage);
  });

  if (renderOptions.serveInitialOptionsInSeperateRequest) {
    const initOptPath = path + '/initial_options.js';

    fastify.get(initOptPath, (req, res) => {
      const initialOptions = renderInitSnippet(
        getRequestRenderOptions(req, res, renderOptions)
      );
      res.type('application/javascript').send(initialOptions);
    });
  }
};

export const AltairFastify = fp(fastifyAltairPluginFn, {
  fastify: '>= 3.x',
  name: 'altair-fastify-plugin',
});

function getRequestRenderOptions(
  req: FastifyRequest,
  res: FastifyReply,
  opts: AltairFastifyPluginOptions
): RenderOptions {
  const { baseURL, cspNonceGenerator, ...renderOptions } = opts;
  let cspNonce = renderOptions.cspNonce;
  if (!cspNonce && cspNonceGenerator) {
    cspNonce = cspNonceGenerator(req, res);
  }

  return {
    ...opts,
    baseURL: baseURL ?? '/altair/',
    cspNonce,
  };
}
