import { readFileSync } from 'fs';
import { resolve } from 'path';

export interface RenderOptions {
    /**
     * URL to be used as a base for relative URLs
     */
    baseURL?: string;

    /**
     * URL to set as the server endpoint
     */
    endpointURL?: string;

    /**
     * URL to set as the subscription endpoint
     */
    subscriptionsEndpoint?: string;

    /**
     * Initial query to be added
     */
    initialQuery?: string;

    /**
     * Initial variables to be added
     */
    initialVariables?: string;

    /**
     * Initial pre-request script to be added
     */
    initialPreRequestScript?: string;

    /**
     * Initial headers object to be added
     * @example
     * {
     *  'X-GraphQL-Token': 'asd7-237s-2bdk-nsdk4'
     * }
     */
    initialHeaders?: Object;

    /**
     * Whether to render the initial options in a seperate javascript file or not.
     * Use this to be able to enforce strict CSP rules.
     * @default false
     */
    serveInitialOptionsInSeperateRequest?: boolean;
}

/**
 * Render Altair Initial options as a string using the provided renderOptions
 * @param renderOptions
 */
export const renderInitialOptions = ({
    endpointURL,
    subscriptionsEndpoint,
    initialQuery,
    initialVariables,
    initialHeaders,
    initialPreRequestScript,
}: RenderOptions = {}) => {
    let result = '';
    if (endpointURL) {
        result += `window.__ALTAIR_ENDPOINT_URL__ = \`${endpointURL}\`;`;
    }
    if (subscriptionsEndpoint) {
        result += `window.__ALTAIR_SUBSCRIPTIONS_ENDPOINT__ = \`${subscriptionsEndpoint}\`;`;
    }
    if (initialQuery) {
        result += `window.__ALTAIR_INITIAL_QUERY__ = \`${initialQuery}\`;`;
    }

    if (initialVariables) {
        result += `window.__ALTAIR_INITIAL_VARIABLES__ = \`${initialVariables}\`;`;
    }

    if (initialPreRequestScript) {
        result += `window.__ALTAIR_INITIAL_PRE_REQUEST_SCRIPT__ = \`${initialPreRequestScript}\`;`;
    }

    if (initialHeaders) {
        result += `window.__ALTAIR_INITIAL_HEADERS__ = ${JSON.stringify(initialHeaders)};`;
    }
    return result;
}

/**
 * Render Altair as a string using the provided renderOptions
 * @param renderOptions
 */
export const renderAltair = (options: RenderOptions = {}) => {
    const altairHtml = readFileSync(resolve(__dirname, 'dist/index.html'), 'utf8');
    const initialOptions = renderInitialOptions(options);
    const baseURL = options.baseURL || './';
    if (!initialOptions) {
        return altairHtml.replace(/<base.*>/, `<base href="${baseURL}">`);
    }
    if (options.serveInitialOptionsInSeperateRequest) {
        return altairHtml.replace(/<base.*>/, `<base href="${baseURL}"><script src="initial_options.js"></script>`);
    } else {
        return altairHtml.replace(/<base.*>/, `<base href="${baseURL}"><script>${initialOptions}</script>`);
    }
};



/**
 * Returns the path to Altair assets, for resolving the assets when rendering Altair
 */
export const getDistDirectory = () => resolve(__dirname, 'dist');

export default renderAltair;
