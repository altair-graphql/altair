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
     * Initial headers object to be added
     * @example
     * {
     *  'X-GraphQL-Token': 'asd7-237s-2bdk-nsdk4'
     * }
     */
    initialHeaders?: Object;
}

/**
 * Render Altair as a string using the provided renderOptions
 * @param renderOptions
 */
export const renderAltair = ({baseURL = './'}: RenderOptions = {}) => {
    const altairHtml = readFileSync(resolve(__dirname, 'dist/index.html'), 'utf8');

    return altairHtml.replace(/<base.*>/, `<base href="${baseURL}">`);
};

export const renderInitialOptions = ({
    endpointURL,
    subscriptionsEndpoint,
    initialQuery,
    initialVariables,
    initialHeaders,
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

    if (initialHeaders) {
        result += `window.__ALTAIR_INITIAL_HEADERS__ = ${JSON.stringify(initialHeaders)};`;
    }
    return result;
}

/**
 * Returns the path to Altair assets, for resolving the assets when rendering Altair
 */
export const getDistDirectory = () => resolve(__dirname, 'dist');

export default renderAltair;
