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
  serveInitialOptionsInSeperateRequest?: boolean;
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
 */
export const renderInitialOptions = (options: RenderOptions = {}) => {
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
  const initialOptions = renderInitialOptions(options);
  const baseURL = options.baseURL || './';
  if (options.serveInitialOptionsInSeperateRequest) {
    return altairHtml
      .replace(/<base.*>/, `<base href="${baseURL}">`)
      .replace('</body>', () => `<script src="initial_options.js"></script></body>`);
  } else {
    return altairHtml
      .replace(/<base.*>/, `<base href="${baseURL}">`)
      .replace('</body>', () => `<script>${initialOptions}</script></body>`);
  }
};

const getRenderedAltairOpts = (renderOptions: RenderOptions) => {
  const optProps = Object.keys(renderOptions)
    .filter((key): key is keyof AltairConfigOptions =>
      allowedProperties.includes(key as keyof AltairConfigOptions)
    )
    .map((key) => getObjectPropertyForOption(renderOptions[key], key));

  return ['{', ...optProps, '}'].join('\n');
};

export { getDistDirectory } from './get-dist';
export { getAltairHtml };

export default renderAltair;
