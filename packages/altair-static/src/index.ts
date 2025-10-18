import getAltairHtml from './get-altair-html';
import type { AltairConfigOptions } from 'altair-graphql-core/build/config/options';

export interface RenderOptions extends AltairConfigOptions {
  /**
   * URL to be used as a base for relative URLs
   */
  baseURL?: string;

  /**
   * Whether to render the initial options in a seperate javascript file or not.
   * Use this to be able to enforce strict CSP rules.
   * @default false
   */
  serveInitialOptionsInSeperateRequest?: boolean | string;
}

/**
 * this type assertion is used to ensure that all properties of AltairConfigOptions are included in the RenderOptions.
 * When new properties are added to AltairConfigOptions, this type assertion will throw an error and force the developer to update it accordingly.
 */
type AltairConfigOptionsObject = Record<keyof AltairConfigOptions, undefined>;
const optionsProperties: AltairConfigOptionsObject = {
  endpointURL: undefined,
  subscriptionsEndpoint: undefined,
  subscriptionsProtocol: undefined,
  initialQuery: undefined,
  initialVariables: undefined,
  initialPreRequestScript: undefined,
  initialPostRequestScript: undefined,
  initialHeaders: undefined,
  initialEnvironments: undefined,
  instanceStorageNamespace: undefined,
  initialSettings: undefined,
  initialSubscriptionRequestHandlerId: undefined,
  initialSubscriptionsPayload: undefined,
  initialRequestHandlerId: undefined,
  initialRequestHandlerAdditionalParams: undefined,
  preserveState: undefined,
  initialHttpMethod: undefined,
  initialWindows: undefined,
  disableAccount: undefined,
  persistedSettings: undefined,
  initialName: undefined,
  initialAuthorization: undefined,
  cspNonce: undefined,
};
const allowedProperties = Object.keys(
  optionsProperties
) as (keyof AltairConfigOptions)[];

const getObjectPropertyForOption = (
  option: unknown,
  propertyName: keyof AltairConfigOptions
) => {
  if (typeof option !== 'undefined') {
    switch (typeof option) {
      case 'object':
        return `${propertyName}: ${JSON.stringify(option)},`;
      case 'boolean':
        return `${propertyName}: ${option},`;
    }
    return `${propertyName}: \`${option}\`,`;
  }
  return '';
};

/**
 * Render Altair Initial options as a string using the provided renderOptions
 * @param renderOptions
 * @deprecated Use renderInitSnippet instead
 */
export const renderInitialOptions = (options: RenderOptions = {}) => {
  return renderInitSnippet(options);
};

/**
 * Render Altair init JS snippet as a string using the provided renderOptions
 * @param renderOptions
 */
export const renderInitSnippet = (options: RenderOptions = {}) => {
  return `
        AltairGraphQL.init(${getRenderedAltairOpts(options)});
    `;
};

/**
 * Render Altair as a string using the provided renderOptions
 * @param renderOptions
 */
export const renderAltair = (options: RenderOptions = {}) => {
  const altairHtml = getAltairHtml();
  const initialOptions = renderInitSnippet(options);
  const baseURL = options.baseURL || './';
  if (options.serveInitialOptionsInSeperateRequest) {
    if (!options.cspNonce) {
      // When using cspNonce, the initial options must be inlined to avoid CSP issues
      // because loading a the script in a separate request will likely cause a new CSP nonce to be generated
      // which will not match the original nonce used in the main HTML file
      // and thus the script will be blocked by the browser.
      const scriptName =
        typeof options.serveInitialOptionsInSeperateRequest === 'string'
          ? options.serveInitialOptionsInSeperateRequest
          : 'initial_options.js';
      return altairHtml
        .replace(/<base.*>/, `<base href="${baseURL}">`)
        .replace('<style>', `<style nonce="${options.cspNonce ?? ''}">`)
        .replace(
          '</body>',
          () =>
            `<script type="module" nonce="${options.cspNonce ?? ''}" src="${scriptName.replace(/["'<>=]/g, '')}"></script></body>`
        );
    }
  }

  return altairHtml
    .replace(/<base.*>/, `<base href="${baseURL}">`)
    .replace('<style>', `<style nonce="${options.cspNonce ?? ''}">`)
    .replace(
      '</body>',
      () =>
        `<script type="module" nonce="${options.cspNonce ?? ''}">${initialOptions}</script></body>`
    );
};

const getRenderedAltairOpts = (renderOptions: RenderOptions) => {
  const optProps = Object.keys(renderOptions)
    .filter((key): key is keyof AltairConfigOptions =>
      allowedProperties.includes(key as keyof AltairConfigOptions)
    )
    .map((key) => getObjectPropertyForOption(renderOptions[key], key));

  return ['{', ...optProps, '}'].join('\n');
};

export const isSandboxFrame = (path: string) => {
  return path.split('/').includes('iframe-sandbox');
};

export { getDistDirectory } from './get-dist';
export { getAltairHtml };

export default renderAltair;
